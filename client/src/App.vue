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
      },
      autoGroupColumnDef: {
        cellRendererParams: {
          innerRenderer: function (params) {
            return params.data.name;
          },
        },
      },
      animateRows: true,
      rowModelType: "serverSide",
      treeData: true,
      isServerSideGroup: (dataItem) => dataItem.group,
      getServerSideGroupKey: (dataItem) => dataItem.id,
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
      axios
        .get("/api/dndchars")
        .then((res) => {
          let rows = this.extractRowsFromResponse(res.data);
          setTimeout(() => {
            params.successCallback(rows, rows.length);
          }, 500);
        })
        .catch((err) => console.log(err));
    }
    extractRowsFromResponse(data) {
      let rowData = [];

      function doSomething(arr) {
        arr.forEach((row) => {
          rowData.push(transformRow(row));
          if (row.hasOwnProperty("subclasses")) {
            doSomething(row.subclasses);
          }
        });
      }

      function transformRow(row) {
        const { name, _id, subclasses } = row;

        return {
          name,
          id: _id,
          group: Boolean(subclasses),
        };
      }

      doSomething(data);

      console.log(rowData);

      return rowData;
    }
  }
  return new ServerSideDataSource();
}
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
</style>