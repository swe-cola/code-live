lang_names = {}
create_lang_name = function(ui, runner, mode, mime, disable){
    return {ui,runner,mode,mime,disable};
}
register_lang_name = function(ui, runner, mode, mime,disable=false){
    var itm,lang_type=ui;

    if(Array.isArray(mime))
        itm = create_lang_name(ui,runner,mode,mime,disable);
    else
        itm = create_lang_name(ui,runner,mode,[mime],disable);
    lang_names[lang_type]=itm;
}

lang_name = function(lang_type, target_type){
    if( (lang_type in lang_names)
        &&(!lang_names[lang_type].disable)
        &&(target_type in lang_names[lang_type])
        &&(lang_names[lang_type][target_type]) ){

        return lang_names[lang_type][target_type];
    }else{
        throw `No "${target_type}" for "${lang_type}"`;
    }
}

init_lang_name = function(){
    var list_of_list_of_langs=[
        /* ui / runner / mode / mime */
        ["Python3","python3","text/x-python","python"],
        ["Python","python","text/x-python","python"],
        ["C","c","text/x-csrc","clike"],
        ["C++","cpp","text/x-c++src","clike"],
        ["C#","csharp","text/x-csharp","clike"],
        ["Objective-C","objective-c","text/x-objectivec","clike"],
        ["JavaScript","javascript","text/javascript","javascript"],
        ["Java","java","text/x-java","clike"],

        ["R","r","text/x-rsrc","r"],
        ["Go","go","text/x-go","go"],
        ["Perl","perl","text/x-perl","perl"],
        ["Ruby","ruby","text/x-ruby","ruby"],
        ["PHP","php","application/x-httpd-php",["htmlmixed","xml","javascript","css","clike","php"]],

        ["VB Script","vbscript","text/vbscript","vbscript"],
        ["F#","fsharp","text/x-fsharp","mllike"],
        ["Swift","swift","text/x-swift","swift"],
        ["Scheme","scheme","text/x-scheme","scheme"],
        ["Common Lisp","commonlisp","text/x-common-lisp","commonlisp"],
        ["CoffeeScript","coffeescript","coffeescript","coffeescript"],
        
        ["D","d","text/x-d","d"],
        ["Rust","rust","text/x-rustsrc","rust"],
        ["Scala","scala","text/x-scala","clike"],
        ["Kotlin","kotlin","text/x-kotlin","clike"],
        ["Erlang","erlang","text/x-erlang","erlang"],
        ["Haskell","haskell","text/x-haskell","haskell"],
        ["Clojure","clojure","text/x-clojure","clojure"],

    ];
    for(var lang of list_of_list_of_langs){
        register_lang_name(...lang);
    }
}

init_lang_name();

const cdn_mode_root = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode`;
const imported = new Set();

async function get_mime_js(lang_type){
    const mime = lang_name(lang_type,'mime');
    if(mime.length==0)
        return;

    for(var i = 0 ; i<mime.length; i++){

        if(imported.has(mime[i]))
            continue;

        const mime_url = cdn_mode_root + `/${mime[i]}/${mime[i]}.js`
        await jQuery.getScript(mime_url);
        imported.add(mime[i]);
    }
}
