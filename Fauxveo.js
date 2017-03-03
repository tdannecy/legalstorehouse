//::::::::::   :::     :::    ::: :::    ::: :::     ::: ::::::::::  ::::::::  
//:+:        :+: :+:   :+:    :+: :+:    :+: :+:     :+: :+:        :+:    :+: 
//+:+       +:+   +:+  +:+    +:+  +:+  +:+  +:+     +:+ +:+        +:+    +:+ 
//:#::+::# +#++:++#++: +#+    +:+   +#++:+   +#+     +:+ +#++:++#   +#+    +:+ 
//+#+      +#+     +#+ +#+    +#+  +#+  +#+   +#+   +#+  +#+        +#+    +#+ 
//#+#      #+#     #+# #+#    #+# #+#    #+#   #+#+#+#   #+#        #+#    #+# 
//###      ###     ###  ########  ###    ###     ###     ##########  ########  

//Kyle Goetschius, 4/15/2015
//Updated 3/3/2017

//Global Array of All Library Items
var AllLib = [];
//Global Array to store search results - allows further filtering
var SearchArray = [];
//Facets users can filter by
//Add 'Languages' to this array to enable, uncomment section in html
var EnabledFacets = ['Language'];

//initialization to set event handlers
$(function(){
    $(".facetBox input").change(applyFilters);
    $("#search").keyup(function (e) {
        e.preventDefault();
        $("#facetTags").empty();
        var searchTerm = $("#search").val();
        filterBySearch(AllLib, searchTerm);

        if($("#search").val() == ""){
            //reset global array, search field contents, and result count on page
            SearchArray = [];
            $("#search").val("");
            $("#countCopy").html("");
        }
    });
    $("#searchForm").submit(function (e) {
        e.preventDefault();
        $("#facetTags").empty();
        var searchTerm = $("#search").val();
        filterBySearch(AllLib, searchTerm);
    });
})

_.mixin({
    //mixin to allow passing array of possible matches to _.filter()
    'findByValues': function (collection, property, values) {
        return _.filter(collection, function (item) {
            return _.contains(values, item[property]);
        });
    },
    //For use with properties that have an array of values
    'checkIntersection': function (collection, property, values) {
        return _.filter(collection, function (item) {
            return _.intersection(values, item[property]).length;
        });
    }
});

//get all items in library and render them
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
            AllLib[i].Language = AllLib[i].Language.replace(/\s/g, '').split(",");
        }
        var facetsToRender = getApplicableFacets(AllLib);
        renderFacetInputs(facetsToRender);
        renderResultsArray(AllLib, "#Results");
    },
  error: function (jqXHR, textStatus, errorThrown){
    console.log("Error" + errorThrown);
  }
})

//convert mm/dd/yyyy strings to Date objects
function mmddyyyyToDate(dateString) {
    var split = dateString.split("/");
    return new Date(split[2], split[0] - 1, split[1]);  
}

function getApplicableFacets(anArray) {
    var facetObj = {
        Language: []
    }

    _.forEach(anArray, function (item, index) {
        _.forOwn(item, function (value, key) {
            if (_.includes(EnabledFacets, key)){
                if (typeof (value) == "string") {
                    if (!_.includes(facetObj[key], value)) {
                        facetObj[key].push(value);
                        console.log("Pushed string " + value);
                    }
                }
                //typeof will return 'object' for arrays!
                else if (typeof (value) == typeof ([])) {
                    _.forEach(value, function (item, index) {
                        if (!_.includes(facetObj[key], item)) {
                            facetObj[key].push(item);
//                             console.log("Pushed array value " + item);
                        }
                    });
                }
                else {
                    console.log("unknown type");
                }
            }
        });
    });
    facetObj.Language = facetObj.Language.sort();
    return facetObj;
}

function renderFacetInputs(aFacetObj) {
    _.forOwn(aFacetObj, function (value, key) {
        $("#" + key + "Inputs").empty();
        _.forEach(value, function (item, index) {
            $("#" + key + "Inputs").append("<input type='checkbox' name='" + key + "' value='" + item + "'><label for='" + key + "'>" + item + "</label><br>");
        });
    });
    //Reset event handlers on inputs
    $(".facetBox input").change(applyFilters);
}

//appends html for each result
//takes two args, array to render and jQuery selector where items should be rendered
function renderResultsArray(array, target) {
    $(target).empty();
  array.sort(function (a, b) {
    var textA = a.Name.toUpperCase();
    var textB = b.Name.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
    for (var i = 0; i < array.length; i++) {
        $(target).append("<div class='libResult'><a href='" + array[i].Link + "' target='_blank'><h2>" + array[i].Name + "</h2></a>Published: <span class='facetDate'>" + array[i].Year + "</span><p>" + array[i].MetaDescription + "</p></div>");
    }

    $('#count').html(array.length);
}

function filterBySearch(arrayToFilter, searchTerm) {
    //if search term is in title or description - add to searchResults array
    SearchArray = _.filter(arrayToFilter, function (item) {
        if (item.Origin.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
            item.Name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
            item.Descriptors.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
            item.MetaDescription.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 
           ) {
            return true;
        } else {
            return false;
        }
    });

    var facetsToRender = getApplicableFacets(SearchArray);
    renderFacetInputs(facetsToRender);
    renderResultsArray(SearchArray, "#Results");
    displaySearchTag(searchTerm);
}

function getAllFilters() {
    var facetObj = {
//         Type: [],
//         Regions: [],
//         Topics: [],
//         Agendas: [],
        Language: []
    }

    //Add values of selected checkboxes to arrays stored in an object's property corresponding to the facet 
//     $("input[name='Type']:checked").each(function () { facetObj.Type.push(this.value) });
//     $("input[name='Regions']:checked").each(function () { facetObj.Regions.push(this.value) });
//     $("input[name='Topics']:checked").each(function () { facetObj.Topics.push(this.value) });
//     $("input[name='Agendas']:checked").each(function () { facetObj.Agendas.push(this.value) });
    $("input[name='Language']:checked").each(function () { facetObj.Language.push(this.value) });

    return facetObj;
}

function applyFilters() {
  console.log("Applyfilters is called");
    var facetObj = getAllFilters();

    var filteredArray = [];

    //If SearchArray is set, facets can be used to further filter results
    if (SearchArray.length) {
        filteredArray = SearchArray;
    } else {
        filteredArray = AllLib;
    }

    _.forOwn(facetObj, function (value, key) {
      console.log(key, value);
        //If a facet thas no boxes checked, don't filter by that facet
        if (facetObj[key].length) {
            //Only one type per resource in library, use findByValues()
            if (key === "Type") {
                filteredArray = _.findByValues(filteredArray, "Type", facetObj["Type"]);
            //checkIntersection() determines if two arrays have common members
            } else {
                filteredArray = _.checkIntersection(filteredArray, key, facetObj[key]);
            }
        }
    });
    
    displayFacetTags(facetObj);
    renderResultsArray(filteredArray, "#Results");
}


//TAGS indicate the currently applied filters (search or facets) and remove corresponding filter on click
function displayFacetTags(facetObj) {
    $("#facetTags").empty();
    _.forOwn(facetObj, function (value, key) {
        if (facetObj[key].length) {
            $(facetObj[key]).each(function () {
                //Needs Tag Template
                $("#facetTags").append("<div facet='" + key + "' class='facetTag' value='" + this + "'>[x] " + this + "</div>");
            });
        }
    });
    $(".facetTag").each(function (i, tag) {
        $(tag).click(function (e) {
            var facet = e.target.getAttribute('facet');
            var value = e.target.attributes.value.textContent;

            //Uncheck the corresponding input on click
            $("input[name='" + facet + "'][value='" + value + "']").prop('checked', false).change();
        });
    });
}

//Displays a tag with the search term that can be clicked to clear search
function displaySearchTag(searchTerm) {
    $("#countCopy").html(" for: <strong>" + searchTerm + "</strong> <span id='clearSearch'>Clear Search</span>");
    $("#clearSearch").click(function () {
        //reset global array, search field contents, and result count on page
        SearchArray = [];
        $("#search").val("");
        $("#countCopy").html("");

        //restore inputs to all facets
        var facetsToRender = getApplicableFacets(AllLib);
        renderFacetInputs(facetsToRender);
        applyFilters();
    });
}
