
//var movieFinderApp = (function(){

	/******************************** GLOBAL VAR *******************************
	****************************************************************************/

	"use-strict";

	var movies = $('#movies');
	var searchInput = $('#search');
	var yearInput = $('#year');
	var imdbArray = [];
	var counterArray;
	var url = "http://www.omdbapi.com/?";
	var totalResults;
	var pagIndex = 1;
	var pag = $('#pagination-links');
	var pagLink;
	var pagBuilt = false;


	/******************************** FUNCTIONS *******************************
	***************************************************************************/


	/*************************** PAGINATION FUNCTIONS ***************************/

	//Build out the pagination links
	function buildPaginationLinks(number){
		var liString = "";
		var pagNumber = number;
		var pagWidth;
		var pagWidthNumber;
		counterArray = [];
		$('.pagination').html("");
		var pagLength = counterArray.length + 1;

		liString += '<li class="page-item previous disabled">';
		liString += '<a class="page-link" href="#" aria-label="Previous">';
		liString += '<span aria-label="true">&laquo;</span>';
		liString += '<span class="sr-only">Previous</span>';
		liString += '</a></li>';

		for(var i = 0; i < pagNumber; i++){
			if(i < 5){
				liString += '<li class="page-item number">';
				liString += '<a class="page-link page-number" href="#">';
				liString += i + 1;
				liString += '</a></li>';
			}

			counterArray.push(i);

		}

		liString += '<li class="page-item next">';
		liString += '<a class="page-link" href="#" aria-label="Next">';
		liString += '<span aria-label="true">&raquo;</span>';
		liString += '<span class="sr-only">Next</span>';		
		liString += '</a></li>';


		$('.pagination').html(liString);
		$('.pagination .number').eq(0).addClass('active');
		pag.show('fast');


		pagWidth = $('#pagination-links').css('width');
		pagWidthNumber = parseInt(pagWidth) / 2;
		pag.css({
			'margin-left': '-' + pagWidthNumber.toString() + 'px'
		});

		pagLink = $('.number');
	}

	function pagLinkNumber(number){
		var pagLinks = Math.ceil(number / 10);
		return pagLinks;

	}

	function nextButton(){
		var numberList = $('.number a');
		var pagLength = counterArray.length;
		var number;

		//Check to see if the pagination has reached the last allowed page
		
		if(pagLength < 6){
			
			return false

		} else if(pagIndex === pagLength){
			
			if(!$('.next').hasClass('disabled')){
				$('.next').addClass('disabled')
			}

			return false;
		}

		//Increae the Pagination Numbers by 1
		for(var i = 0; i < numberList.length; i++){
			number = parseInt(numberList.eq(i).html());
			number++;
			var numberString = number.toString();
			numberList.eq(i).html(numberString);
		}

		//Increase the PagIndex by 1
		pagIndex++;

		//Remove Disabled from the Prev Button
		if($('.previous').hasClass('disabled')){
			$('.previous').removeClass('disabled');
		}	
	}

	//Decrease the pagination number listing and apply a disblaed
	function prevButton(){
		var numberList = $('.number a');
		var number;
		var previous = $('.previous');

		if(pagIndex < 2){

			if(!$('.previous').hasClass('disabled')){
				$('.previous').addClass('disabled');
			}	

			return false;

		} else {
			for(var i = 0; i < numberList.length; i++){
				number = parseInt(numberList.eq(i).html());
				number--;
				var numberString = number.toString();
				numberList.eq(i).html(numberString);
			}

			pagIndex--;

		}
	}	

	function scroll(){
		var number = parseInt($('.number.active').children().html());
		return number;
	}

	/*************************** ON PAGE MOVIE CONTENT  ***************************/

	//Build out the movie poster section based on the AJAX Request
	function buildMovieList(response, search){
		var movieFinder = response.Search;
		var movieResponse = response.Response;
		totalResults = response.totalResults;
		var pagResults = pagLinkNumber(totalResults);
		var movieIndv = "";

		//Empty the Array of imdb Arrays
		imdbArray = [];

		//Create the page movie elements if a response has come through
		if(movieResponse === 'True'){
			$.each(movieFinder, function(index, movie){
				imdbArray.push(movie.imdbID)
				movieIndv += '<li>';
				movieIndv += '<div class="poster-wrap">';

				if(movie.Poster === "N/A"){
					movieIndv += '<i class="material-icons poster-placeholder">';
					movieIndv += 'crop_original';
					movieIndv += '</i>';
				} else {
					movieIndv += '<img class="movie-poster" src=';
					movieIndv += movie.Poster + '>';
				}

				movieIndv += '</div>';
				movieIndv += '<span class="movie-title">';
				movieIndv += movie.Title;
				movieIndv += '</span>';
				movieIndv += '<span class="movie-year">';
				movieIndv += movie.Year;
				movieIndv += '</span>';
				movieIndv += '</li>';		
			});

				//Place the Newly built code into the DOM
				movies.html(movieIndv);

				//If a pagination has already been put on the page, don't build another one and use the one currently built
				if(!pagBuilt){
					//$('.number').remove();
					buildPaginationLinks(pagResults);
					pagBuilt = true;
				}	
		
		//Show no results if a movie can't be found
		} else {
				movieIndv += '<li class="no-movies">';
				movieIndv += '<i class="material-icons icon-help">';
				movieIndv += 'help_outline';
				movieIndv += '</i>No movies found that match: ' + search + '.';
				movieIndv += '</li>';

				movies.html(movieIndv);
		}
	}

	//Build out the description section if a user clicks on a particular movie poster
	function loadDescriptionArea(response) {
		var title = response.Title;
		var ratingImdb = response.imdbRating;
		var year = response.Year;
		var poster = response.Poster;
		var plot = response.Plot;
		var tomatoLink = response.tomatoURL;

		//Desc Elements
		var $h1 = $('.desc-content-area h1');
		var $imdb = $('.imdb-rating');
		var $plot = $('.desc-content-area p').eq(1);
		var $imdbLink = $('.imdb-button');
		var $posterImg = $('.desc-image');

		//On page updates
		$h1.html(title);
		$imdb.html('IMDB Rating: ' + ratingImdb);
		$plot.html(plot);
		$imdbLink.attr('href', tomatoLink);
		$posterImg.attr('src', poster);

		descriptionTransition();

	}	

	//Transition between between the movie poster search results and the individual movie description section
	function descriptionTransition(){
		$('.main-content').toggleClass('on-screen');
		$('.desc-content').toggleClass('on-screen');
	}

	/*************************** AJAX REQUESTS ***************************/

	//Run an AJAX Request on the Search bar of the movie app
	function runAjaxSearch(number){
		var searchValue = searchInput.val();
		var yearValue = yearInput.val();
		var input = {
			s : searchValue,
			y : yearValue,
			r : 'json',
			tomatoes: true,
			plot : 'short',
			page : number
		}

		$.ajax({
			url: url,
			data: input,
			method: "GET",
			success: function(response){
				buildMovieList(response);
			}	
		});
	}

	//Run an AJAX Request utilizing the IMDB ID of a particular movie. This enables pull content for the description area 
	function runAjaxDesc(lookup){
		var input = {
			i : lookup,
			plot: 'Full',
			r: 'json',
			tomatoes: true
		}

		$.ajax({
			url: url,
			data: input,
			method: 'GET',
			success: function(response){
				loadDescriptionArea(response);		
			}
		});
	}

	//
	function findClickedMovie(element){
		var movieElement = element.target.closest('li');
		var allmovieElements = $('#movies li');
		var index = 0;

		for(var i = 0; i < allmovieElements.length; i++){
			if(allmovieElements[i] === movieElement){
				break;
			} else {
				index++;
			}
		}
		return index;
	}


	/******************************** CLICK EVENTS *******************************
	*****************************************************************************/

	//Run AJAX lookup using the IMDB ID capture from the initial load of the page.
	$('#movies').on('click','li', function(event){
		var index = findClickedMovie(event);
		var imdbSearch = imdbArray[index]
		runAjaxDesc(imdbSearch);
		$('#pagination-links').fadeOut('fast');
	});

	//Search for a movie based the search inputs
	$('#submit').click(function(event){
		pagBuilt = false;
		runAjaxSearch(1);	
		event.preventDefault();	
	});

	//Go back to the movie listing section from the DESCRIPTION area
	$('.back-results span').click(function(){
		descriptionTransition();
		$('#pagination-links').fadeIn('slow');
	});

	//Change page number based on click on pagination number
	pag.on('click', '.page-number', function(){
		$('.number').removeClass('active');
		$(this).closest('.number').addClass('active');
		var pagNumber = parseInt($(this).html());
		pagIndex = pagNumber
		runAjaxSearch(pagNumber);
	});

	//Apply a scroll of the pagination links - INCREASE Number and run AJAX Request on new Active Number
	pag.on('click', '.previous', function(){
		prevButton();
		var page = scroll();
		runAjaxSearch(page);
	});

	//Apply a scroll of the pagination links - DECREASE Number and run AJAX Request on new Active number
	pag.on('click', '.next', function(){
		nextButton();
		var page = scroll();
		runAjaxSearch(page);
	});

	//Hide the pagination section on load
	pag.hide();


//});

//movieFinderApp();
