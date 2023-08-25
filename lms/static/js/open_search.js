var now = new Date();
var index = 0;
var currentTotal = 0;
var state = 0 //0:can get data 1:waiting data 2: no more data
var filters = {
"search_string": "",
"order_by": "",
"year": "",
"state": ""
}
var fake_orgs = {
	"course-v1:openuchile+CLIL_1+2023_1":"CLIL",
	"course-v1:openuchile+CMS-B+2023_1":"CMS",
	"course-v1:openuchile+CMS-BI+2023_1":"CMS",
	"course-v1:openuchile+CMS-C1+2023_1":"CMS",
	"course-v1:openuchile+CMS-C2+2023_1":"CMS",
	"course-v1:openuchile+CMS-C3+2023_1":"CMS",
	"course-v1:openuchile+CMS-C4+2023_1":"CMS",
	"course-v1:openuchile+CMS-DO+2023_1":"CMS",
	"course-v1:openuchile+CMS-E+2023_1":"CMS",
	"course-v1:openuchile+CMS-EB+2023_1":"CMS",
	"course-v1:openuchile+CMS-EIE+2023_1":"CMS",
	"course-v1:openuchile+CMS-ILS+2023_1":"CMS",
	"course-v1:openuchile+CMS-IVE+2023_1":"CMS",
	"course-v1:openuchile+CMS-L+2023_1":"CMS",
	"course-v1:openuchile+CMS-PC+2023_1":"CMS",
	"course-v1:openuchile+CMS-PD+2023_1":"CMS",
	"course-v1:openuchile+CMS-PE+2023_1":"CMS",
	"course-v1:openuchile+CMS-PF+2023_1":"CMS",
	"course-v1:openuchile+CMS-PI+2023_1":"CMS",
	"course-v1:openuchile+CMS-PMN+2023_1":"CMS",
	"course-v1:openuchile+CMS-PP+2023_1":"CMS",
	"course-v1:openuchile+DCS_01+2023_1":"DCS",
	"course-v1:openuchile+DCS_02+2023_1":"DCS",
	"course-v1:openuchile+DCS_03+2023_1":"DCS",
	"course-v1:openuchile+DCS_04+2023_1":"DCS",
	"course-v1:openuchile+DEM_01+2023_1":"DEM",
	"course-v1:openuchile+ECBI_01+2023_1":"ECBI",
	"course-v1:openuchile+ECBI_02+2023_1":"ECBI",
	"course-v1:openuchile+FCFM_OP1+2023_1":"CMS",
	"course-v1:openuchile+FEN-EF+2023_2":"DCS",
	"course-v1:openuchile+M002+dic.2021":"CR2",
	"course-v1:openuchile+M003+2022_T3":"REUNA",
	"course-v1:openuchile+M004+2022_T2":"CMS",
	"course-v1:openuchile+M005+2022_T2":"CMS",
	"course-v1:openuchile+M006+2022_T2":"CMS",
	"course-v1:openuchile+M007+2022_T2":"CMS",
	"course-v1:openuchile+M008+2022_T2":"CMS",
	"course-v1:openuchile+M009+2022_T2":"CMS",
	"course-v1:openuchile+M010+2022_T2":"CMS",
	"course-v1:openuchile+M011+2022_T2":"CMS",
	"course-v1:openuchile+M012+2022_T2":"CMS",
	"course-v1:openuchile+M013+2023_T1":"REUNA"
}
var fake_filter = {
"org": ""
}
var translation = {
"Starts": "Empieza",
"Viewing": "Mostrando",
"courses": "cursos",
"course": "curso",
"Newer": "Más nuevo",
"Older": "Más antiguo",
"Refine Your Search": "Refinar su búsqueda",
"Sort by:": "Ordenar por:",
"Year:": "Año:",
"Finished course": "Curso finalizado",
"Permanently open": "Abierto permanentemente"
}
$(window).load(function() {
    /*if(document.documentElement.lang == "es-419" ){
        //delete when translations have been generated
        $('.facet-option.discovery-button.order_by').each(function( index ) {
        $( this ).text(T($( this ).data('text')))
        });
        $('.search-facets .header-facet').each(function( index ) {
        $( this ).text(T($( this ).data('text')))
        });
    }*/
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('search_query')){ 
        initDiscovery(urlParams.get('search_query'));
        AddBtnFilterBar("search_string", filters["search_string"]);
    }
    else initDiscovery();
    $(window).scroll(function() {
    if($(window).scrollTop()  > $(window).height() / 2) {
        if (state == 0){
        state = 1;
        getData();
        }
    }
});
function initDiscovery(search_string=""){
    index = 0;
    currentTotal = 0;
    state = 1;
    filters = {
    "search_string": search_string,
    "order_by": "",
    "year": "",
    "state": ""
    };
    fake_filter = {"org": ""};
    getData();
}

function getData(){
    var pages = {"page_size": 100, "page_index": index }
    var copy = {...filters, ...pages};
    
    $.post( "/search/course_discovery/", copy )
    .done(function( data ) {
    var count = 0;
    data.results.forEach(element => {
        edx.HtmlUtils.append($("#list-courses")[0], createCourse(element.data));
    });
    if (fake_filter.org != "") {
        $('#list-courses').hide();
        $('#list-courses li.courses-listing-item.open_org_'+fake_filter.org).each(function( index ) {
        $( this ).clone().appendTo("#list-courses_orgs");
        });
    }
    currentTotal = currentTotal + data.results.length;
    if (data.total > currentTotal){
        index = index + 1;
        state = 0;
    }
    else state = 2;
    //$("#discovery-message").text(T("Viewing")+' ' + data.total + " "+T("courses"));
    });
}

$('.search-facets-lists button').live('click', function(e) {
    e.preventDefault();
    $(this).blur();
    $("#list-courses_orgs").empty();
    let facet = $(this).data("facet");
    let display_name = T($(this).data("text"));
    let add_btn = true;
    if ($(this).hasClass("selected")){
    $(this).removeClass("selected");
    if(facet == "open_org") fake_filter.org = "";
    else filters[$(this).data("facet")] = "";
    add_btn = false;
    }
    else{
    $(this).addClass("selected");
    if(facet == "open_org") fake_filter.org = $(this).data("value");
    else filters[$(this).data("facet")] = $(this).data("value");
    if($("."+$(this).data("facet")).not(this).hasClass("selected")) $("."+$(this).data("facet")).not(this).removeClass("selected");
    }
    if (add_btn) AddBtnFilterBar(facet, display_name);
    else {
    $("#" + facet).remove();
    if ( $('#active-filters').children().length == 0 ) $('#filter-bar').addClass("is-collapsed");
    }
    if(facet == "open_org"){
    if (add_btn) {
        $('#list-courses').hide();
        $('#list-courses li.courses-listing-item.open_org_'+$(this).data("value")).each(function( index ) {
        $( this ).clone().appendTo("#list-courses_orgs");
        });
    }
    else {
        $('#list-courses').show();
    }
    }
    else{
    let list_course1 = getCourses();
    // executes when promise is resolved successfully
    list_course1.then(
        function successValue(result) {
            console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    )
    .finally(
        function greet() {
        }
    );
    }
    
});

$('#clear-all-filters').live('click', function(e) {
    e.preventDefault();
    $('#filter-bar').addClass("is-collapsed");
    $("#active-filters").html('');
    cleanCourses();
    initDiscovery();
});
$('#filter-bar .facet-option.discovery-button').live('click', function(e) {
    e.preventDefault();
    $("#list-courses_orgs").empty();
    let btnType = $(this).data('type');
    $("#" + btnType).remove();
    if ( $('#active-filters').children().length == 0 ) $('#filter-bar').addClass("is-collapsed");
    if (btnType == "open_org") fake_filter.org = "";
    else filters[btnType] = "";
    $('.search-facets-lists button.'+btnType+'.selected').removeClass("selected");

    if(btnType == "open_org") $('#list-courses').show();
    else {
    let list_course2 = getCourses();
    // executes when promise is resolved successfully
    list_course2.then(
        function successValue(result) {
            console.log(result);
            //AddBtnFilterBar(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    )
    .finally(
        function greet() {
        
        }
    );
    }
});

$('#discovery-submit').live('click', function(e) {
    e.preventDefault();
    $('.icon.fa.fa-search').css("visibility", "hidden");
    $('#loading-indicator').toggleClass('hidden');
    filters["search_string"] = $("#discovery-input").val();
    let list_course3 = getCourses();
    // executes when promise is resolved successfully
    list_course3.then(
        function successValue(result) {
            console.log(result);
            AddBtnFilterBar("search_string", filters["search_string"]);
            
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    )
    .finally(
    function greet() {
        $('.icon.fa.fa-search').css("visibility", "visible");
        $('#loading-indicator').toggleClass('hidden');
    }
    );
});

function T(w){
    // translate to spanish
    if(document.documentElement.lang == "es-419" && translation[w] !== undefined ){
    return translation[w];
    }
    else return w;
}

function getCourses(){
    cleanCourses();
    // returns a promise
    return new Promise(function (resolve, reject) {
    getData();
    //pasar datos a resolve
    resolve('Promise success');
    reject('Promise rejected');
    });
    
}

function createCourse(data){
    /*
    "data": {
        "id": "course-v1:eol+NA303+2022",
        "course": "course-v1:eol+NA303+2022",
        "content": {
            "display_name": "Test202",
            "overview": " About This Course Include your long course description here. The long course description should contain 150-400 words. This is paragraph 2 of the long course description. Add more paragraphs as needed. Make sure to enclose them in paragraph tags. Requirements Add information about the skills and knowledge students need to take this course. Course Staff Staff Member #1 Biography of instructor/staff member #1 Staff Member #2 Biography of instructor/staff member #2 Frequently Asked Questions What web browser should I use? The Open edX platform works best with current versions of Chrome, Edge, Firefox, Internet Explorer, or Safari. See our list of supported browsers for the most up-to-date information. Question #2 Your answer would be displayed here. ",
            "number": "NA303"
        },
        "image_url": "/asset-v1:eol+NA303+2022+type@asset+block@images_course_image.jpg",
        "start": "2022-01-01T00:00:00+00:00",
        "end": "2023-11-30T00:00:00+00:00",
        "number": "NA303",
        "enrollment_start": "2021-01-01T00:00:00+00:00",
        "enrollment_end": "2021-12-31T00:00:00+00:00",
        "org": "eol",
        "modes": [
            "audit"
        ],
        "language": "en"
        }
    */
    var org = "";
    if (fake_orgs[data.id] !== undefined) org = "open_org_"+fake_orgs[data.id];
    const coursehtml = '<li class="courses-listing-item '+org+'"><article class="course" role="region" aria-label="{course_display_name}">'+
    '<a href="/courses/{course}/about"><header class="course-image">'+
    '<div class="cover-image"><img src="{image_url}" alt="{course_display_name}">'+
    '<div class="learn-more" aria-hidden="true">APRENDER MAS</div></div></header>'+
    '<section class="course-info" aria-hidden="true"><h2 class="course-name">'+
    '<span class="course-organization">{org}</span><span class="course-code">{number}</span><span class="course-title">{course_display_name}</span>'+
    '</h2><div class="course-date" aria-hidden="true">{formatDate}</div>'+
    '</section><div class="sr"><ul><li>{org}</li><li>{number}</li><li><time itemprop="startDate" datetime="{start}">{formatDate}</time></li>'+
    '</ul></div></a></article></li>';
    data["course_display_name"] = data.content.display_name;
    data["formatDate"] = formatDate(data.start, data.end);
    return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(coursehtml), data);
}

function formatDate(start, end){
    var start_date  = new Date(start);
    if (end !== undefined){
    var end_date = new Date(end);
    if(end_date < now) return T("Finished course");
    else return translate_date(start_date);
    }
    else{
    if(now >= start_date) return T("Permanently open");
    else return translate_date(start_date);
    }
}

function translate_date(date){
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    if(document.documentElement.lang == "es-419" ){
    return date.toLocaleDateString("es-ES", options);
    }
    return date.toLocaleDateString("en-US", options);
}

function AddBtnFilterBar(type, value){
    if ( $('#active-filters').children().length == 0 ) $('#filter-bar').removeClass("is-collapsed");
    createBtnActiveFilters(type, value)
}

/*function createActiveFilters(){
    let filterBarHtml = '<div class="filters-inner"><ul id="active-filters" class="active-filters facet-list">'+
        '</ul><button id="clear-all-filters" class="clear-filters flt-right discovery-button">Borrar todo</button></div>';
    edx.HtmlUtils.append($("#filter-bar")[0], edx.HtmlUtils.HTML(filterBarHtml));
}*/

function createBtnActiveFilters(type, value){
    $("#" + type).remove();
    let buttons = '<li class="active-filter" id="{type}"><button data-value="{value}" class="facet-option discovery-button" data-type="{type}">'+
        '<span class="query">"{value}"</span><span aria-hidden="true" class="fa fa-times"></span></button></li>';
    let filterBtn = edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(buttons), {type:type, value:value});
    edx.HtmlUtils.append($("#active-filters")[0], filterBtn);
}
function removeBtnActiveFilters(type, value){
    $("#" + type).remove();
    if ( $('#active-filters').children().length == 0 ) $('#filter-bar').addClass("is-collapsed");
}
function cleanCourses(){
    index = 0;
    currentTotal = 0;
    state = 1;
    $("#discovery-message").text("");
    $("#list-courses").html('')
}
})