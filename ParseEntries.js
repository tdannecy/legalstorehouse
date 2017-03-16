$(function(){
    console.log("k");
    $.ajax({
        url: "Entries.json", 
        success: function (data, textStatus, jqXHR) {
            AllLib = data;

            for (var i = 0; i < AllLib.length; i++) {
    //             AllLib[i].Date = mmddyyyyToDate(AllLib[i].Date);
    //             //Create arrays from semi-colon delimited lists
    //             AllLib[i].Agendas = AllLib[i].Agendas.split(";");
    //             AllLib[i].Regions = AllLib[i].Regions.split(";");
    //             AllLib[i].Topics = AllLib[i].Topics.split(";");
    //            AllLib[i].Language = AllLib[i].Language.replace(/\s/g, '').split(",");
                AllLib[i].Collections = [];
                var keys = Object.keys(AllLib[i]);
                for (var j = 0; j < keys.length; j++) {
                    if(keys[j].startsWith("Topics ")){
                        var num = keys[j].charAt(7);
                        console.log(AllLib[i]);
                        AllLib[i].Collections.push(
                            {
                                "Topic": AllLib[i][keys[j]],
                                "Note": AllLib[i]["Note " + num]
                            }
                        )
                    }
                }
            }
        },
      error: function (jqXHR, textStatus, errorThrown){
        console.log("Error" + errorThrown);
      }
    });
});
