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
    clearFilter();
    getData();
}

function getData(){
    var pages = {"page_size": 20, "page_index": index }
    var copy = {...filters, ...pages};
    $.post( "/course_classification/search/", copy )
    .done(function( data ) {
        if (data.error == undefined) {
            for (let i = 0; i < data.results.length; i += 2) {
                const container = document.getElementById("list-courses"); 
                let element_added = 0
                const courseHtml = createCourse(data.results[i], data.results[i].extra_data);
                const courseHtml2 = createCourse(data.results[i+1], data.results[i+1].extra_data);
                if (element_added % 2 === 0) {
                    row = document.createElement('div');
                    row.className = 'row ml-5 mr-5 d-flex justify-content-center w-100';
                    container.appendChild(row);
                }
                element_added = element_added + 1
                edx.HtmlUtils.append(row, courseHtml);
                edx.HtmlUtils.append(row, courseHtml2);
            }
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

$('#advance-button').live('click', function(e) {
    const $div_filter = $('#filter-bar');
    const $div_courses = $('#section-courses');

    if ($div_filter.css('display') === 'none' || $div_filter.css('display') === '') {
        $div_filter.css('display', 'block');
        $div_filter.addClass("col-md-3");
        $div_courses.removeClass("col-md-12");
        $div_courses.addClass("col-md-9");
    } else {
        $div_filter.css('display', 'none');
        $div_filter.removeClass("col-md-3");
        $div_courses.removeClass("col-md-9");
        $div_courses.addClass("col-md-12");
    }
});

$('.open-filter-bar .search-facets-lists input[type="checkbox"]').live('change', function(e) {
    e.preventDefault();
    let facet = $(this).data("facet");
    let display_name = gettext($(this).data("text"));
    let add_btn = true;
    if (this.checked){
        filters[facet] = $(this).data("value");
        $('.open-filter-bar .search-facets-lists input[data-facet="'+facet+'"]').not(this).prop( "checked", false );
    }
    else{
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
            console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    );
});

$('#state-select, #year-select, #order-select').live('change', function(e) {
    e.preventDefault();
    let facet = $(this).data("facet");
    filters[facet] = gettext($(this)[0].value);

    let list_course1 = getCourses();
    // executes when promise is resolved successfully
    list_course1.then(
        function successValue(result) {
            // console.log(result);
        },
    )
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    );
});

$('#FilterOffcanvasBottom .search-facets-lists input[type="checkbox"]').live('change', function(e) {
    e.preventDefault();
    $('.open-filter-bar .search-facets-lists input[data-facet="'+$(this).data("facet")+'"][data-value="'+$(this).data("value")+'"]').trigger( "click" );
    $('#FilterOffcanvasBottom button.btn-close').trigger( "click" );
});

function clearFilter(){
    filters["state"] = ""
    filters["year"] = ""
    filters["order_by"] = ""
    let select = document.getElementById('state-select');
    select.selectedIndex = 0;
    select = document.getElementById('year-select');
    select.selectedIndex = 0;
    select = document.getElementById('order-select');
    select.selectedIndex = 0;
}

$('.open-filter-bar #clear-filters').live('click', function(e) {
    e.preventDefault();
    $('.open-filter-bar #filter-bar').css("display", "none");
    $(".open-filter-bar #active-filters").html('');
    $('.open-filter-bar .search-facets-lists input').prop( "checked", false );
    clearFilter();
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
            console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
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

    filters["search_string"] = $("#discovery-input").val();
    let list_course3 = getCourses();
    // executes when promise is resolved successfully
    list_course3.then(
        function successValue(result) {
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
    let button_html = '<button type="button" class="dark-blue-button w-100 mb-0 '
    if (data.course_state == 'ongoing_enrollable' || data.course_state == 'upcoming_enrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('Enroll now')
    }else if(data.course_state == 'upcoming_notenrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('Coming soon')
    }else if(data.course_state == 'ongoing_notenrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('See more')
    }else if (data.course_state == 'completed'){
        button_html = button_html + data.course_state +'_color">'+gettext('Finished')
    }

    button_html =button_html +'</button>'
    const coursehtml = 
    '<div class="col-md-4 col-sm-12 mb-3 mx-3 p-2">'+
        '<div class="card {is_active} h-100" data-about="/courses/{course}/about" data-state="{state}" style="cursor: pointer;" onclick="window.location.href = this.dataset.about">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-12">'+
                    '<div class="card-body">'+
                        '<div class="row g-0 p-0">'+
                            '<figure><img src="{image_url}" class="card-img-top img-fluid rounded-start" alt="{course_display_name}"></figure>'+
                        '</div>'+
                        '<strong><h5 class="card-title fw-bold my-2" title="{course_display_name}">{course_display_name}</h5></strong>'+
                        '{course_date_html}'+
                        '<div class="card-card-button mt-2 p-0 mb-0">'+
                            '<a href="/courses/{course}/about">'+ button_html +'</a>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
    data['course_date_html'] = create_course_date_html(data.start, data.end, extra_data.advertised_start)
    data["course_display_name"] = data.content.display_name;
    data["is_active"] = course_is_active(data.end);
    data["state"] = data.course_state || '';
   
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
    const html1 = '<div class="col-md-12 justify-content-start"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
    '<div class="open-course-date-text"><span>{date_text}</span></div></div>';
    const html2 = '<div class="col-md-6"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha inicio.svg"></div>'+
    '<div class="open-course-date-text"><span>'+gettext("Start date")+'</span>'+
    '<div class="course-date" aria-hidden="true">{start_date}</div> </div>'+
    '</div><div class="col-md-6"><div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
    '<div class="open-course-date-text"><span>'+gettext("End date")+'</span>'+
    '<div class="course-date" aria-hidden="true">{end_date}</div></div></div>';
    const html_new = 
    '<div class="row ct3 my-2">'+
        '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-2 col-sm-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha inicio.svg"></div>'+
                '</div>'+
                '<div class="col-md-10 col-sm-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Duration")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{start_date}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
         '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-2 col-sm-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/modalidad.svg"></div>'+
                '</div>'+
                '<div class="col-md-10 col-sm-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Modality")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{start_date}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>'+
    '<div class="row ct3 my-2">'+
        '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-2 col-sm-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/precio.svg"></div>'+
                '</div>'+
                '<div class="col-md-10 col-sm-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Price")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{start_date}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
         '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-2 col-sm-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
                '</div>'+
                '<div class="col-md-10 col-sm-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Classes Start")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{start_date}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
    var start_date  = new Date(start);
    var date_data = {
        'start_date': translate_date(start_date),
        'end_date': ''
    };
return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html_new), date_data);
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

function cleanCourses(){
    index = 0;
    currentTotal = 0;
    state = 1;
    $(".open-filter-bar #discovery-message").text("");
    $("#list-courses").empty();
}
})
