var runner_timeout = 10000;
var runner_polling_interval = 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJsonQuery(api_url,params,fetch_option){
    api_url.search = new URLSearchParams(params).toString();
    return fetch(api_url,fetch_option)
        .then(res=>{return res.json()});
}

function runnerCreate(scriptLang, scriptContents, scriptInput){
    var url_create = new URL('http://api.paiza.io:80/runners/create');
    var params = {
        source_code: scriptContents,
        language: scriptLang,
        input: scriptInput,
        api_key:'guest'
    };
    return fetchJsonQuery(url_create,params,{method:'POST'});
}
function runnerGetStatus(paramid){
    var url_get_status = new URL('http://api.paiza.io:80/runners/get_status');
    var params = {
        api_key:'guest',
        id:paramid
    };
    return fetchJsonQuery(url_get_status,params);
}
function runnerGetDetails(paramid){
    var url_get_details = new URL('http://api.paiza.io:80/runners/get_details');
    var params = {
        api_key:'guest',
        id:paramid
    };
    return fetchJsonQuery(url_get_details,params);
}

async function runScript(scriptLang, scriptContents, scriptInput){
    var runner_session = await runnerCreate(scriptLang,scriptContents,scriptInput);
    var status = runner_session.status;
    var timeout_left = runner_timeout;

    while(status!='completed' && timeout_left>0){
        await sleep(runner_polling_interval);
        timeout_left -= runner_polling_interval;
        var result = await runnerGetStatus(runner_session.id);
        status = result.status;
    };
    if(status!='completed')
        return {
            result:'failure',
            status:'completed',
            stderr:'timeout'
        }
    else
        return await runnerGetDetails(runner_session.id);
}
