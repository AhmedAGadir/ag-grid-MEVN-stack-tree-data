import axios from "axios";
import qs from "qs";

class ServerSideDataSource {
    getRows(params) {
        const {
            request: {
                startRow,
                endRow,
                groupKeys,
                sortModel,
                filterModel
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
            .get("/api/filesystem", {
                params: {
                    startRow,
                    endRow,
                    groupKeys,
                    sortModel,
                    filterModel
                },
                // qs allows us to pass arrays in the GET request config
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
    getFilterValues(field) {
        return new Promise((resolve, reject) => {
            axios.get(`/api/filesystem/values/${field}`)
                .then(response => resolve(response.data))
                .catch(err => reject(err));
        })
    }
}

export default ServerSideDataSource;