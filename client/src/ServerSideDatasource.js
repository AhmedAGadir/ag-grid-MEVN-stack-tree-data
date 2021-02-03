import axios from "axios";

class ServerSideDataSource {
    getRows(params) {
        const {
            request: {
                startRow,
                endRow,
                groupKeys,
                sortModel,
                filterModel,
                valueCols
            },
            success,
            failCallback } = params;


        let AG_GRID_AUTOCOLUMN = 'ag-Grid-AutoColumn';

        if (Object.keys(filterModel).length > 0) {
            if (filterModel.hasOwnProperty(AG_GRID_AUTOCOLUMN)) {
                filterModel.folder = { ...filterModel[AG_GRID_AUTOCOLUMN] };
                delete filterModel[AG_GRID_AUTOCOLUMN];
            }
        }

        let autoGroupSortingIndex = sortModel.findIndex(sM => sM.colId === AG_GRID_AUTOCOLUMN);
        if (autoGroupSortingIndex !== -1) {
            sortModel[autoGroupSortingIndex].colId = 'folder'
        }

        axios
            .post("/api/filesystem", {
                data: {
                    startRow,
                    endRow,
                    groupKeys,
                    sortModel,
                    filterModel,
                    valueCols
                },
            })
            .then((res) => {
                console.log("response data", res.data);
                success({
                    rowData: res.data.rows,
                    rowCount: res.data.lastRowIndex
                });
            })
            .catch((err) => {
                fail(() => console.log("failed"));
            });
    }
    getFilterValues(field) {
        return new Promise((resolve, reject) => {
            axios.get(`/api/filesystem/values/${field}`)
                .then(response => resolve(response.data))
                .catch(err => reject(err));
        })
    }
}

export default ServerSideDataSource;