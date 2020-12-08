var runner_timeout = 10000;
var runner_polling_interval = 512;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url,data){
    return await $.ajax({
        crossDomain: true,
        url: url,
        type: "POST",
        data: data,
    });
}

async function runner_api_test(){
    var a = await runnerGetDetails("db_QO3lJlolQ8TQ2SzL1ng")
    console.log(a)
}

function runnerCreate(scriptLang, scriptContents, scriptInput){
    var params = {
        source_code: scriptContents,
        language: scriptLang,
        input: scriptInput
    };
    return fetchJson('/api/runner/create',params);
}
function runnerGetStatus(paramid){
    var params = {
        id:paramid
    };
    return fetchJson('/api/runner/get_status',params);
}
function runnerGetDetails(paramid){
    var params = {
        id:paramid
    };
    return fetchJson('/api/runner/get_details',params);
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
