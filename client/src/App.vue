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
      console.log("params", params);
      const { request, successCallback, failCallback } = params;
      const { startRow, endRow, groupKeys } = request;

      console.log("request", request);

      // function transformRows(rows) {
      //   return rows.map((row) => ({
      //     charClass: row.charClass,
      //     id: row._id,
      //     group: true,
      //   }));
      // }

      axios
        .get("/api/dndchars", {
          params: {
            startRow,
            endRow,
            groupKeys,
          },
          // qs allows us to pass an array in the config params
          paramsSerializer: (params) => qs.stringify(params),
        })
        .then((res) => {
          console.log("response data", res.data);

          // let rows = transformRows(res.data);
          successCallback(res.data, res.data.length);
        })
        .catch((err) => {
          failCallback(() => console.log("failed"));
        });
      //   axios
      //     .get("/api/dndchars")
      //     .then((res) => {
      //       let rows = this.extractRowsFromResponse(res.data);
      //       setTimeout(() => {
      //         params.successCallback(rows, rows.length);
      //       }, 500);
      //     })
      //     .catch((err) => console.log(err));
      // }
      // extractRowsFromResponse(data) {
      //   console.log("data before", data);
      //   let rowData = [];

      //   function doSomething(arr) {
      //     arr.forEach((row) => {
      //       rowData.push(transformRow(row));
      //       if (row.hasOwnProperty("subclasses")) {
      //         doSomething(row.subclasses);
      //       }
      //     });
      //   }

      //   function transformRow(row) {
      //     const { charClass, _id, subclasses } = row;

      //     return {
      //       charClass,
      //       id: _id,
      //       group: subclasses.length > 0,
      //     };
      //   }

      //   doSomething(data);

      //   console.log(rowData);

      // return rowData;
    }
  }
  return new ServerSideDataSource();
}
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
</style>