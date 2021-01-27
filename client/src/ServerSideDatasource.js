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
            successCallback,
            failCallback } = params;

        console.log("request", params.request);

        if (Object.keys(filterModel).length > 0) {

            console.log('filterModel before', filterModel);

            if (filterModel.hasOwnProperty('ag-Grid-AutoColumn')) {
                filterModel.folder = { ...filterModel['ag-Grid-AutoColumn'] };
                delete filterModel['ag-Grid-AutoColumn'];
            }
            console.log('new filter Model', filterModel)
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
                successCallback(res.data.rows, res.data.lastRowIndex);
            })
            .catch((err) => {
                failCallback(() => console.log("failed"));
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