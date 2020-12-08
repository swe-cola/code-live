var notify_new_chat = null;

$(function () {
    $('[data-toggle="tooltip"]').tooltip({
        trigger : 'hover'
    });

    $('.btn-group .dropdown-menu .dropdown-item').on('click',function() {
    
        var id = $(this).parent().attr('aria-labelledby');
        var dropLabel = $('#'+id);
        $(this).addClass('active');
        $(this).siblings().removeClass('active');

        const desc = dropLabel.data('desc');
        const value = desc ? `${desc}: ${$(this).text()}` : $(this).text();
        dropLabel.text(value);
    });

    $('#btnFontSizeGroupDrop').parent().find('.dropdown-menu .dropdown-item').on('click', function() {

        const fontSize = parseInt($(this).text());
        $('.CodeMirror').css('font-size', fontSize);
    });

    $('#btnTabSizeGroupDrop').parent().find('.dropdown-menu .dropdown-item').on('click', function() {

        const tabSize = parseInt($(this).text());
        const cm = $('.CodeMirror')[0].CodeMirror;
        cm.setOption('indentUnit', tabSize);
        cm.setOption('tabSize', tabSize);
    });

    $('#darkModeSwitch input[type=checkbox]').on('click', function() {

        const cm = $('.CodeMirror')[0].CodeMirror;
        if ($(this).prop('checked')) {
        // Dark mode
        cm.setOption('theme', 'material');
        } else {
        // Light mode
        cm.setOption('theme', 'solarized');
        }
    });

    $("#sublime, #vim, #emacs").on('click', function() {

        var keymap = $(this).text();
        const cm = $('.CodeMirror').get(0).CodeMirror;
        cm.setOption('keyMap', keymap)
    });

    $('#btnLanguageGroupDrop').parent().find('.dropdown-menu .dropdown-item').on('click', async function() {

        const lang = $(this).text();
        const cm = $('.CodeMirror')[0].CodeMirror;
        const mode = lang_name(lang,'mode');

        await get_mime_js(lang);
        cm.setOption('mode', mode);
        update_root('lang', lang);
    });

    $('#executeScript').on('click',async function(){

        var lang_key = $('#btnLanguageGroupDrop').siblings().find(".dropdown-item.active").text();
        var lang = lang_name(lang_key, "runner");
        var scriptText = $('.CodeMirror')[0].CodeMirror.getValue();
        var scriptInput = $('#script-input').val();
        $('#console').val('Executing..');

        var run_result = await runScript(lang,scriptText,scriptInput);
        var output = [run_result.build_stderr, run_result.stdout, run_result.stderr];
        output = output.filter(o=>{return o!=null && o!="";});
        $('#console').val( output.join('\n') );
    });

    // ================
    // registering order of
    // $('.nav-link').on('click')
    // and $('#tabbutton-chat').on('click')
    // is important.
    // register ".nav-link" one first.
    let currentNav = "";
    $('.nav-link').on('click', function(ev) {
        let clickedNav = $(this).attr("href");
        if (currentNav === clickedNav){
            currentNav = "";
            $(".tab-content").addClass("dis_none");
            $(this).removeClass("active");
            ev.stopPropagation();
            return
        }
        currentNav = clickedNav;
        $(".tab-content").removeClass("dis_none");
    });
    $('#tabbutton-chat').on('click', function() {
        let clickedNav = $(this).attr("href");
        if(clickedNav==currentNav){
            $("#chat-notification").addClass('hide');
        }
    });
    notify_new_chat = function(){
        if(currentNav!='#tabChat'){
            console.log(currentNav);
            $("#chat-notification").removeClass('hide');
        }
    }
    // ================
});
