generate_dropdown_items = function(id,item_list,def){
    var dropdown = $("#"+id);
    var group = document.createElement("div");
    group.className = "dropdown-menu scrollable-menu";
    group.setAttribute("aria-labelledby",id);

    dropdown.parent().append(group);

    for(var i=0;i<item_list.length; i++){

        var child = document.createElement("a");
        child.className = "dropdown-item";
        if(def==item_list[i]){
            child.className += " active";
        }
        child.innerText = item_list[i];
        child.href = "#";

        group.appendChild(child);
    }
};

$(_=>{
    generate_dropdown_items("btnFontSizeGroupDrop",
        [8, 9, 10 ,11, 12, 14, 18, 24, 30, 36, 48],
        14);
    generate_dropdown_items("btnTabSizeGroupDrop",
        [2,4],
        4);
    generate_dropdown_items("btnLanguageGroupDrop",
        Object.keys(lang_names),
    );
});
