<template>
  <ag-grid-vue
    style="width: 800px; height: 500px"
    class="ag-theme-alpine"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
  >
  </ag-grid-vue>
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-enterprise";

import ServerSideDatasource from "./ServerSideDatasource";

export default {
  name: "App",
  data() {
    return {
      serverSideDatasource: null,
      gridApi: null,
      columnApi: null,
      gridOptions: {},
    };
  },
  components: {
    AgGridVue,
  },
  beforeMount() {
    this.serverSideDatasource = new ServerSideDatasource();

    this.gridOptions = {
      columnDefs: [
        // {
        //   field: "folder",
        //   cellRenderer: "agGroupCellRenderer",
        // },
        { field: "dateModified" },
        {
          field: "size",
          aggFunc: "sum",
        },
      ],
      defaultColDef: {
        width: 240,
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
        filterParams: {
          values: (params) => {
            const {
              colDef: { field },
              success,
            } = params;

            this.serverSideDatasource.getFilterValues(field).then((values) => {
              console.log("filter values", values);
              success(values);
            });
          },
        },
        filterParams: {
          values: (params) => {
            const {
              colDef: { field },
              success,
            } = params;

            this.serverSideDatasource
              .getFilterValues("folder")
              .then((values) => {
                console.log("filter values", values);
                success(values);
              });
          },
        },
      },
      // groupSuppressAutoColumn: true,
      autoGroupColumnDef: {
        cellRendererParams: {
          innerRenderer: (params) => params.data.folder,
        },
      },
      animateRows: true,
      rowModelType: "serverSide",
      treeData: true,
      isServerSideGroup: (dataItem) => dataItem.isGroup,
      getServerSideGroupKey: (dataItem) => dataItem._id,
    };
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;

      params.api.sizeColumnsToFit();

      params.api.setServerSideDatasource(this.serverSideDatasource);
    },
  },
};
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
</style>