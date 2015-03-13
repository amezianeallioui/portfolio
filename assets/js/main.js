$window = $(window);

var configScrollreveal = {
	mobile: false
};

$window.load(function(){
	Portfolio.init();
	window.scrollReveal = new scrollReveal(configScrollreveal);
	scrollReveal.init();
});


/**** NAVIGATION GENERALE DANS LE PORTFOLIO ****/

Portfolio = {

	currentPage : "",
	works : [],

	init : function(){

		that = this;

		$loader = $("#loader");
		$intro = $("#introduction");
		$header = $("header");

		// Chargement des travaux
		$.getJSON("works.json", function(result){
			// Affichage des sites
			that.preloadSite(result.works);

		});

	},
		
	preloadSite : function(works){

		var loadedImages = 0, countedImages = works.length;

    	$.each(works, function(i, w){

    		that.works[i] = new Work(i,w);
    		that.works[i].init();   		

    		loadedImages++;

    		// CREER OBJET PROGRESSBAR
/*    		$('#progress-bar').velocity(
				{'width' : (loadedImages/countedImages)*100 + '%'}, 
				200, "ease", 
				function(){
					// si toutes les images on été téléchargées, on fait disparaitre la progress bar
					if(loadedImages == countedImages){
						$("#progress-bar").velocity(
							{'top' : '-10px'}, 
							{ 	
								delay:500, 
								complete:function(){
									$(this).css("display","none");
									that.showIntro();
								}
							}
						);
					}
				}
			);
*/
			/* ANIMATE */

			$('#progress-bar').animate(
				{"width" : (loadedImages/countedImages)*100 + '%'},
				{duration : 500, complete: function(){
					if(loadedImages == countedImages){
						$( this ).delay(500).animate(
							{'top' : '-10px'},
							{ 	
								complete:function(){
									$(this).css("display","none");
									that.showIntro();
								}
							}
						);
					}
				}}
			); 

		});
	},

	showIntro : function(){

		var introLeftPosition = ($window.width() - $intro.width())/2;

		$intro.css("left", introLeftPosition+"px").animate({opacity: 1}, 500, function(){
			$(this).on('click', '#enter-portfolio', that.enterPortfolio);
		});
	},

	enterPortfolio : function(){

		that.currentPage = "about";

		$intro.animate(
			{ opacity:0, top: "-=100"  },
			{ duration:300, /*easing:"easeInOutBack", */complete: function(){

					$intro.remove();

					setTimeout(function(){
						
						$header.find("nav ul li:first a").addClass("blue-light");
						
						$header.css("display", "block").animate({"top":0}, 200, "linear");
						
						$("#about")
						.css("display", "block")
						.delay(100)
						.animate(
							{opacity:1}, 
							{duration:500, /*delay:100,*/  
							complete: function(){that.addClickListenerOnLink();}}
						);

					}, 1000);
				}
			}
		);	

	},

	addClickListenerOnLink : function(){

		// Bouton retour en haut sur page projet

		$('body').on('click', 'a', function(e){
			
			e.preventDefault();


			/*($(this).attr("href") && that.scrollTo($(this).attr("href")))
			||
			(($(this).data("page") && $(this).data("page")!=that.currentPage) && that.hideCurrentPage($(this).data("page")))
			|| 
			($(this).data("id") && that.works[$(this).data("id")].prepareWork());*/

			// var link = $(this).data("page") ||;

			if($(this).data("page")){

				var link = $(this).data("page");
				if(link != that.currentPage){
					that.hideCurrentPage(link);	
				}

			}else if($(this).attr("href")){

				var link = $(this).attr("href");

				if(link.indexOf('#') > -1){
					that.scrollTo(link);
				}else{
					link = link.split("/");
					id = link[1];
					that.works[id].showWork();
				}

			}
			
		});
	},

	hideCurrentPage : function(newPage){

		$header.find("nav a").each(function(){
			$(this).data("page") == newPage ? $(this).addClass("blue-light") : $(this).removeClass("blue-light");
		});

		$("#"+that.currentPage)
		.animate(
			{ /*scale : 0.95, */opacity : 0 }, 
			{ 
				duration : 300,  
				// easing : "easeInOutBack", 
				complete: function(){
					$(this).css({"display": "none"});/*.animate({scale :1 }, function(){*/
						that.showPage(newPage);
					// });
					// $header.velocity({"top": -$header.outerHeight() }, 300, "linear");
				}
			}
		);

	},

	showPage : function(page){

		$("#"+page).css("display", "block").delay(200).animate({opacity:1}, {duration:300, /*delay:200,*/ complete:function(){that.currentPage = page}});
			
	},

	scrollTo : function(link, time){
		var time = time || 750;
		$('html, body').animate({ scrollTop: $(link).offset().top }, time, "linear");
		return false;
	}


}

var Work = function(i , work){

	this.id = i,
	this.name = work.name,
	this.title = work.title,
	this.description = work.description,
	this.technologies = work.technologies,
	this.date = work.date,
	this.context = work.context,
	this.gallery = work.gallery;
/*	this.countedImages = work.gallery.length;*/
/*	this.loadedImages = 0;
*/	this.allImagesLoaded = false;
	
	this.init = function(){

		var self = this;
		// Ajout du projet dans le DOM (page works)

		$('<img alt="'+self.title+'" src="assets/img/'+ self.name+'/'+self.name+'.jpg">').load(function(){
			// console.log(self, this);
			// Création du lien vers le projet
			// 			
			var $work = $('<a class="work" href="works/'+ self.id +'"><div><span class="title">'+ self.title +'</span></div></a>');
			// Ajout de l'image dans le lien
			$work.find("div").before($(this));
			// Ajout du lien dans la page "works"
			$work.appendTo("#wrapper-works");
		});
	},

	this.showWork = function(){

		var self = this;
		console.log(self);

		// Désactivation des clics sur les thumbnails
		// $("#works .work").off("click");

		// Scroll en haut de la page
		Portfolio.scrollTo("body", 200);

	 	// si la page "single-work" est déjà ouverte, on la fait disparaitre
	 	if($("#single-work").css("display")!="none"){
	 		$("#single-work").animate({/*"scale":0.95, */"opacity":0}, 300, /*"ease",*/ function(){
		 			// $(this).animate({"scale":1});
					console.log(self);
		 			self.preparePageSingleWork();
	 			}
	 		);
	 	}else{
	 		self.preparePageSingleWork();
	 	}

	},

	this.preparePageSingleWork = function(){

		var self = this;

		var page = "#single-work";

	 	// Ajout des informations sur la page

		$(page+" #title").html(self.title);
		$(page+" #description").html(self.description);
		$(page+" #technologies span").html(self.technologies);
		$(page+" #date span").html(self.date);
		$(page+" #context").html(self.context);

		var id = self.id;
		var works = Portfolio.works;

		// précédent projet
		// $(page+' #previous-work').attr('href','works/'+prevWork.name);
		var prevWork = id == 0 ? works[works.length-1] : works[id-1];
		// var prevWorkId = prevWork.id.toString();
		$(page+" #previous-work .legend-array span").html(prevWork.title);
		// $(page+" #previous-work").data("id", prevWork.id);
		$(page+" #previous-work").attr("href", "works/"+prevWork.id);

		// projet suivant
		var nextWork = id+1 == works.length ? works[0] : works[id+1];
		// var nextWorkId = nextWork.id.toString();
		$(page+" #next-work .legend-array span").html(nextWork.title);
		// $(page+" #next-work").data("id", nextWork.id);
		$(page+" #next-work").attr("href", "works/"+nextWork.id);

		// init progress-bar

		loaderProjectImages.init(self);

	}

};

var loaderProjectImages = {

	project : {},
	countedImages: 0,
	loadedImages : 0,
	allImagesAlreadyLoaded : false,

	init : function(project){

		this.project = project;
		var images = project.gallery;
		this.countedImages = project.gallery.length;
		this.loadedImages = 0;
		this.allImagesAlreadyLoaded = project.allImagesLoaded;

		self = this;

		$("#wrapper-pictures").empty();
		$("#progress-bar").css({"display": "block", "top":"0", "width":"0"});

		for(var i in images){

			var title = images[i].title;
			var url = "assets/img/"+project.name+"/"+images[i].url+".jpg";

			var image = new Image();

			$(image).attr({src:url, alt: title});

			if (image.complete || image.readyState === 4) {
				self.addImage(title, url);
			}else{
				$(image).one("load", self.addImage(title, url));
			}
		}
	}, 

	addImage : function(title, url){

		var $wrapperImage = $("<div class='picture' data-sr='enter top over 1s'><h3>"+title+"</h3><img src='"+url+"' alt='"+title+"'></div>");

		$wrapperImage.appendTo($("#wrapper-pictures"));

		self.loadedImages++;

		if(!(self.allImagesAlreadyLoaded)){
			if(self.loadedImages <= self.countedImages){
				self.updateProgressBar();
			}
		}else{
			if(self.loadedImages == self.countedImages){
				self.showPageSingleWork();
			}
		}

	},

	updateProgressBar : function(){

		var loadedImages = self.loadedImages, 
		countedImages = self.countedImages;

		$('#progress-bar')
			// .stop()
			.animate(
				{'width' : (loadedImages/countedImages)*100 + '%'}, 
				200, 
				/*"ease", */
				function(){
				console.log(loadedImages, countedImages);
				if(loadedImages == countedImages){
					Portfolio.works[self.project.id].allImagesLoaded = true;
					$(this).animate(
						{'top' : '-10px'}, 
						{ 	
							complete:function(){
								self.showPageSingleWork();
							}
						}
					);
				}	

			});
	},

	showPageSingleWork : function(){

		$("header").animate({"opacity":"0"});

		$("#works").animate({"opacity":"0"}, 400);

		var $singleWorks = document.querySelector("#single-work");
		$singleWorks.style.display = "block";
		$singleWorks.style.opacity = 1;

		/*$("#single-work").css({"display" : "block"})
		.delay(100)
		.animate(
			{"opacity":1}, 
			{ duration: 400 }
		);*/

		$("#cross").on('click', function(){
			self.closeWork();		
		});

		$(document).keyup(function(e){
			if (e.keyCode == 27) { self.closeWork(); }  
		});
	},

	closeWork : function(){
		$("#single-work").animate({/*"scale":0.98,*/ "opacity":0}, 400, /*"ease",*/ function(){
				$(this).css("display", "none");/*.animate({"scale":1})*/
				$("header").animate({"opacity":"1"}, 300);
				$("#works").animate({"opacity":"1"}, 300);
		});



	}
}


/*************/
/* PAGE SINGLE-WORK */
/*************/

// var $navigation = $(".navigation"),
// limit = 90;

// $window.on('scroll', function(){

// 	var s = $(this).scrollTop();

// 	if(s>=limit){
// 		$navigation.addClass("fixed");
// 	}else{
// 		$navigation.removeClass("fixed");
// 	}
// });

/****************/
/* FORMULAIRE DE PAGE CONTACT */
/****************/

var $name = $('#form-name'),
$email = $('#form-email'),
$message = $('#form-message'),
emailReg = new RegExp(/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i);

/* Fonctions pour vérifier les valeurs rentrées dans chaque champ */

function checkName(){
	$name.val()!="" && $name.val().length < 2 ? $name.addClass("error") : $name.removeClass("error");
}

function checkEmail(){
	$email.val()!="" && !emailReg.test($email.val()) ? $email.addClass("error") : $email.removeClass("error");
}

function checkMessage(){
	$message.removeClass("error");
}

/* Changement de valeur des champs */

$name.change(function() { checkName(); });
$email.change(function(){ checkEmail(); });
$message.change(function(){ checkMessage(); });
	
/* Soumission du formulaire */

$("#form").on("submit", function(e){
	
	e.preventDefault();

	$this = $(this);

	var valid_form = $name.val().length > 1 && emailReg.test($email.val()) && $message.val()!="";

	if(!valid_form){

		$name.val().length > 1 ? $name.removeClass("error") : $name.addClass("error");

		emailReg.test($email.val()) ? $email.removeClass("error") : $email.addClass("error");

		$message.val().length != 0 ? $message.removeClass("error") : $message.addClass("error");

	}else{

		$name.removeClass("error");
		$email.removeClass("error");
		$message.removeClass("error");

		$.ajax({
			type : $this.attr("method"),
			url : $this.attr("action"),
			data : $this.serialize(),
			dataType : 'json',
			success : function(json){	
				$('#form-notif').addClass("green").hide().html(json.response).slideDown("slow").delay(2000).slideUp("slow", function(){
					$('#form-notif').removeClass("green")
				});

				$name.val("");
				$email.val("");
				$message.val("");
			},
			error : function(result, statut, error){
				$('#form-notif').addClass("red").html("An error has occured. Please try again.").slideDown("slow").delay(2000).slideUp().removeClass("red");
			}	
		});
	}

});