<template>
  <ag-grid-vue
    style="width: 500px; height: 500px"
    class="ag-theme-alpine"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
  >
  </ag-grid-vue>
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-enterprise";
import axios from "axios";
import qs from "qs";

export default {
  name: "App",
  data() {
    return {
      gridApi: null,
      columnApi: null,
      gridOptions: {},
    };
  },
  components: {
    AgGridVue,
  },
  beforeMount() {
    this.gridOptions = {
      columnDefs: [],
      defaultColDef: {
        width: 240,
        resizable: true,
        sortable: true,
      },
      autoGroupColumnDef: {
        cellRendererParams: {
          innerRenderer: function (params) {
            return params.data.charClass;
          },
        },
      },
      animateRows: true,
      rowModelType: "serverSide",
      treeData: true,
      isServerSideGroup: (dataItem) => dataItem.group,
      getServerSideGroupKey: (dataItem) => dataItem._id,
    };
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      var datasource = createServerSideDatasource();
      params.api.setServerSideDatasource(datasource);
    },
  },
};

function createServerSideDatasource() {
  class ServerSideDataSource {
    getRows(params) {
      const { request, successCallback, failCallback } = params;
      const { startRow, endRow, groupKeys, sortModel } = request;

      console.log("request", request);
      console.log("sortModel", sortModel);

      axios
        .get("/api/dndchars", {
          params: {
            startRow,
            endRow,
            groupKeys,
            sortModel,
          },
          // qs allows us to pass an array in the config params
          paramsSerializer: (params) => qs.stringify(params),
        })
        .then((res) => {
          console.log("response data", res.data);

          successCallback(res.data, res.data.length);
        })
        .catch((err) => {
          failCallback(() => console.log("failed"));
        });
    }
  }
  return new ServerSideDataSource();
}
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
</style>