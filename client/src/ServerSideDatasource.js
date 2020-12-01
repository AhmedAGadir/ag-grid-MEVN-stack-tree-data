import axios from "axios";
import qs from "qs";

class ServerSideDataSource {
    getRows(params) {
        const { request, successCallback, failCallback } = params;
        const { startRow, endRow, groupKeys, sortModel } = request;

        console.log("request", request);

        axios
            .get("/api/dndchars", {
                params: {
                    startRow,
                    endRow,
                    groupKeys,
                    sortModel,
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
        if (field === 'charclass') {
            field = 'charClass';
        }
        return new Promise((resolve, reject) => {
            axios.get(`/api/dndchars/values/${field}`)
                .then(response => resolve(response.data))
                .catch(err => reject(err));
        })
    }
}

export default ServerSideDataSource;