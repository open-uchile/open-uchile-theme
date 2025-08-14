var now = new Date();

var index = 0;
var currentTotal = 0;
var state = 0 //0:can get data 1:waiting data 2: no more data
var filters = {
    "search_string": "",
    "order_by": "",
    "year": "",
    "state": "",
    "classification": ""
}

$(window).load(function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('search_query')){ 
        initDiscovery(urlParams.get('search_query'));
        if (filters["search_string"] != "") AddBtnFilterBar("search_string", filters["search_string"]);
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
        "state": "",
        "classification":""
    };
    getData();
}

function getData(){
    var pages = {"page_size": 20, "page_index": index }
    var copy = {...filters, ...pages};
    
    $.post( "/course_classification/search/", copy )
    .done(function( data ) {
        if (data.error == undefined) {
            data.results.forEach(element => {
                edx.HtmlUtils.append($("#list-courses")[0], createCourse(element, element.extra_data));
            });
        }else{
            console.log("ERROR:" + data.error)
        }
    
        currentTotal = currentTotal + data.results.length;
        if (data.total > currentTotal){
            index = index + 1;
            state = 0;
        }
        else state = 2;
        $(".open-filter-bar #discovery-message").text(gettext("Showing")+" " + data.total + " "+ gettext("courses"));
    });
}

$('.open-filter-bar .search-facets-lists input[type="checkbox"]').live('change', function(e) {
    e.preventDefault();
    //$(this).blur();
    let facet = $(this).data("facet");
    let display_name = gettext($(this).data("text"));
    let add_btn = true;
    if (this.checked){
        //$(this).addClass("selected");
        filters[facet] = $(this).data("value");
        $('.open-filter-bar .search-facets-lists input[data-facet="'+facet+'"]').not(this).prop( "checked", false );
    }
    else{
        //$(this).removeClass("selected");
        filters[facet] = "";
        add_btn = false;
    }
    if (add_btn) AddBtnFilterBar(facet, display_name);
    else {
        $('.open-filter-bar #active-filters li[data-type="'+facet+'"]').remove();
        if ( $('.open-filter-bar #active-filters').children().length == 0 ) $('.open-filter-bar #filter-bar').css("display", "none");
    }

    let list_course1 = getCourses();
    // executes when promise is resolved successfully
    list_course1.then(
        function successValue(result) {
            //console.log(result);
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
});
$('#FilterOffcanvasBottom .search-facets-lists input[type="checkbox"]').live('change', function(e) {
    e.preventDefault();
    $('.open-filter-bar .search-facets-lists input[data-facet="'+$(this).data("facet")+'"][data-value="'+$(this).data("value")+'"]').trigger( "click" );
    $('#FilterOffcanvasBottom button.btn-close').trigger( "click" );
});
$('.open-filter-bar #clear-filters').live('click', function(e) {
    e.preventDefault();
    $('.open-filter-bar #filter-bar').css("display", "none");
    $(".open-filter-bar #active-filters").html('');
    $('.open-filter-bar .search-facets-lists input').prop( "checked", false );
    cleanCourses();
    initDiscovery();
});
$('#FilterOffcanvasBottom #clear-filters').live('click', function(e) {
    e.preventDefault();
    $('.open-filter-bar a#clear-filters').trigger( "click" );
    $('#FilterOffcanvasBottom button.btn-close').trigger( "click" );
});
$('.open-order-by-btn').live('click', function(e) {
    e.preventDefault();
    let facet = 'order_by';
    let value = $(this).data("value");
    if($(this).hasClass( "open-order-by-selected" )){
        filters[facet] = "";
        $(this).removeClass("open-order-by-selected");
    }
    else{
        $('.open-order-by-btn').not(this).removeClass("open-order-by-selected");
        $(this).addClass( "open-order-by-selected" );
        filters[facet] = value;
    }
    
    let list_course4 = getCourses();
    // executes when promise is resolved successfully
    list_course4.then(
        function successValue(result) {
            //console.log(result);
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
});
$('.open-filter-bar #filter-bar #active-filters span.fa-times').live('click', function(e) {
    e.preventDefault();
    let btnType = this.parentElement.dataset.type;
    $(this.parentElement).remove();
    if ( $('.open-filter-bar #active-filters').children().length == 0 ) $('.open-filter-bar #filter-bar').css("display", "none");
    filters[btnType] = "";
    $('.open-filter-bar .search-facets-lists input[data-facet="'+btnType+'"]').not(this).prop( "checked", false );

    let list_course2 = getCourses();
    // executes when promise is resolved successfully
    list_course2.then(
        function successValue(result) {
            //console.log(result);
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
});
$('#FilterOffcanvasBottom #filter-bar #active-filters span.fa-times').live('click', function(e) {
    e.preventDefault();
    var $parent = $(this).parent();
    $('.open-filter-bar #filter-bar #active-filters li[data-type="'+$parent.data("type")+'"][data-value="'+$parent.data("value")+'"] span.fa-times').trigger( "click" );
    $('#FilterOffcanvasBottom button.btn-close').trigger( "click" );
});
$('#discovery-submit').live('click', function(e) {
    e.preventDefault();
    //$('.icon.fa.fa-search').css("visibility", "hidden");
    //$('#loading-indicator').toggleClass('hidden');
    filters["search_string"] = $("#discovery-input").val();
    let list_course3 = getCourses();
    // executes when promise is resolved successfully
    list_course3.then(
        function successValue(result) {
            //console.log(result);
            if (filters["search_string"] != "") AddBtnFilterBar("search_string", filters["search_string"]);
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
            //$('.icon.fa.fa-search').css("visibility", "visible");
            //$('#loading-indicator').toggleClass('hidden');
        }
    );
});
$('#discovery-input').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        filters["search_string"] = $("#discovery-input").val();
        let list_course3 = getCourses();
        // executes when promise is resolved successfully
        list_course3.then(
            function successValue(result) {
                //console.log(result);
                if (filters["search_string"] != "") AddBtnFilterBar("search_string", filters["search_string"]);
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
                //$('.icon.fa.fa-search').css("visibility", "visible");
                //$('#loading-indicator').toggleClass('hidden');
            }
    );
    }
});
$('#open-filter-mobile-btn').live('click', function(e) {
    e.preventDefault();
    $('#open-filter-mobile-body').empty()
    $('#open-filter-mobile-body').html($('.open-filter-bar').html());
    
    $('.open-filter-bar .search-facets-lists input[type="checkbox"]').each(function( ) {
        if (this.checked) $('#FilterOffcanvasBottom .search-facets-lists input[data-facet="'+$(this).data("facet")+'"][data-value="'+$(this).data("value")+'"]').prop( "checked", true );
    });
});

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

function createCourse(data, extra_data){
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
        "language": "en",
        'short_description', 'advertised_start', 'display_org_with_default', 'main_classification'
        }
    */
    let img_html = '';
    let org_html = '<p class="card-text ct1" title="{org}"><small>{org}</small></p>'
    if ( extra_data.main_classification.logo ) {
        img_html = '<img class="card-logo" src="{mainClass_logo}">';
        data["mainClass_logo"] = extra_data.main_classification.logo;
        org_html = '';
    }
    const coursehtml = '<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 mb-3"><div class="card mb-3 {is_active}" data-about="/courses/{course}/about" data-state="{state}" style="cursor: pointer;" onclick="window.location.href = this.dataset.about"><div class="row g-0"><div class="col-md-7"><figure>'+
    '<img src="{image_url}" class="card-img-top img-fluid rounded-start" alt="{course_display_name}"></figure></div>'+
    '<div class="col-md-5"><div class="card-body">'+img_html+'<h5 class="card-title" title="{course_display_name}">{course_display_name}</h5>'+
    org_html+'<p class="card-text ct2" title="{course_overview}"><small>{course_overview}</small></p>'+
    '<div class="row ct3">{course_date_html}</div><div class="card-button"><a href="/courses/{course}/about"><button type="button" class="btn btn-outline-light">'+gettext("See more")+'</button></a></div>'+
    '</div></div></div></div></div>';
    data['course_date_html'] = create_course_date_html(data.start, data.end, extra_data.advertised_start)
    data["course_display_name"] = data.content.display_name;
    data["course_overview"] = extra_data.short_description || data.content.overview;
    data["is_active"] = course_is_active(data.end);
    data["state"] = data.course_state || '';
    if(extra_data.display_org_with_default != data["org"]) data["org"] = extra_data.display_org_with_default;
    else data["org"] = extra_data.main_classification.name || data.org;
    return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(coursehtml), data);
}
function course_is_active(end){
    if (end !== undefined){
        var end_date = new Date(end);
        if(end_date < now) return 'inactive';
    }
    return ''
}
function create_course_date_html(start, end, advertised_start){
    const html1 = '<div class="col-md-12"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
    '<div class="open-course-date-text"><span>{date_text}</span></div></div>';
    const html2 = '<div class="col-md-6"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha inicio.svg"></div>'+
    '<div class="open-course-date-text"><span>'+gettext("Start date")+'</span>'+
    '<div class="course-date" aria-hidden="true">{start_date}</div> </div>'+
    '</div><div class="col-md-6"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
    '<div class="open-course-date-text"><span>'+gettext("End date")+'</span>'+
    '<div class="course-date" aria-hidden="true">{end_date}</div></div></div>';
    var start_date  = new Date(start);
    var date_data = {
        'start_date': translate_date(start_date),
        'end_date': ''
    };
    if (end !== undefined){
        var end_date = new Date(end);
        date_data['end_date'] = translate_date(end_date);
        if(end_date < now) return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html1), {'date_text':gettext("Finished course")});
    }
    if(advertised_start !== undefined && advertised_start != null && advertised_start != '') return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html1), {'date_text': advertised_start});
    if(now >= start_date & date_data['end_date']  == '') return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html1), {'date_text': gettext("Permanently open")});
    else return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html2), date_data);
}


function translate_date(date){
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    if(document.documentElement.lang == "es-419" ){
    return date.toLocaleDateString("es-ES", options);
    }
    return date.toLocaleDateString("en-US", options);
}

function AddBtnFilterBar(type, value){
    if ( $('#active-filters').children().length == 0 ) $('.open-filter-bar #filter-bar').css("display", "block");
    createBtnActiveFilters(type, value)
}


function createBtnActiveFilters(type, value){
    $('#active-filters li[data-type="'+type+'"]').remove();
    let buttons = '<li data-type="{type}" data-value="{value}">{value}<span aria-hidden="true" class="fa fa-times"></span></li>'
    let filterBtn = edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(buttons), {type:type, value:value});
    edx.HtmlUtils.append($(".open-filter-bar #active-filters")[0], filterBtn);
}
function removeBtnActiveFilters(type, value){
    $("#" + type).remove();
    if ( $('#active-filters').children().length == 0 ) $('#filter-bar').addClass("is-collapsed");
}
function cleanCourses(){
    index = 0;
    currentTotal = 0;
    state = 1;
    $(".open-filter-bar #discovery-message").text("");
    $("#list-courses").empty();
}
})
