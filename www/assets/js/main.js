(function($) {

	var $window = $(window),
		$header = $(".header"),
		$toggle = $('.header__toggle'),
		$intro = $(".intro"),
		$about = $("#about"),
		$works = $(".works"),
		$singleWork = $("#single-work"),
		$contact = $("#contact"),
		headerHeight = $header.outerHeight(true),
		links = ["#about", "#works", "#contact"],
		configScrollreveal = {
			init: false,
			mobile: false
		};


	// Sur Firefox, la propriété css "overflow" du document doit être égal à "hidden"
	// Sinon, les animations sur le scroll ne marcheront pas

	var isFirefox =  typeof InstallTrigger !== 'undefined';

	if(isFirefox){
		$("html").css("overflow", "hidden");
	}

	// Initialisation du plugin scrollReveal
	window.scrollReveal = new scrollReveal(configScrollreveal);

	//Chargement du fichier json avec les informations sur les projets */
	$.getJSON("assets/doc/works.json", function(result){
		// Initialisation de l'objet Portfolio
		Portfolio.init(result);
	});


	/************** CLIC SUR UN LIEN ***************/

	// Ouverture d'une page, scroll vers une ancre
	// ou ouverture d'un lien externe

	/***********************************************/

	$('body').on( 'click', 'a[target!="_blank"]', function(e){

		e.preventDefault();

		var link = $(this).attr("href");

		if(link){
			// Si le lien cliqué fait référence à une page qui n'est pas affichée
			if( $.inArray(link , links) != -1 && link != Portfolio.currentPage){

				// Si on est sur tablette ou mobile
				if($window.width() <= 768){
					// On referme le menu dépliant s'il est ouvert
					$("nav").slideUp(function(){
						$toggle.removeClass("on");
						Portfolio.showPage(link);
					});
				}else{
					Portfolio.showPage(link);
				}

			}else if(link.indexOf("#works/") > -1){ // Page d'un projet

				// Si le lien fait référence à un projet, on affiche celui-ci
				var id = e.currentTarget.dataset.id;
				Portfolio.chooseWork(id);

			}else if(link.indexOf("#") > -1){ // Scroll vers une page

				Portfolio.scrollTo(link);

			}else{ // Lien externe
				window.open(link);
			}
		}

	});

	// Navigation au clavier
	$(document).on('keyup', function(e){

		// Si on est sur la page "single-work"
		if($singleWork.is(":visible")){
			// Escape
			if (e.keyCode == 27) {
				Portfolio.closePageSingleWork(); // Go back to home
			// Left arrow
			}else if(e.keyCode == 37){
				$('#previous-work').trigger("click");
			// Right arrow
			}else if(e.keyCode == 39){
				$('#next-work').trigger("click");
			}
		}
	});



	/**********************************************/
	/**********     OBJET PORTFOLIO     ***********/
  /**********************************************/

	var Portfolio = {

		currentPage : "", // Variable qui gardera en mémoire la page qui est couramment affichée
		works : [], // Tableau qui contiendra tous les projets
		countedWorks : 0, // Nombre de projets
		loadedWorks : 0, // Nombre de projets stockés

		/**
		Permet de stocker les différents projets dans l'objet Portfolio et lancer le chargement de leur miniature
		**/
		init : function( works ){

			var self = this;

			// On stocke le nombre de projets
			self.countedWorks = works.length;

			// Au redimensionnement de la fenêtre, redimensionnement/repositionnement de certains éléments
			$window.on('resize', function(){
				self.resizedWindow();
			});

			// Ecouteur de clique sur le bouton "toggle" pour ouvrir ou fermer le menu
			$toggle.on('click', function(){
				$(this).toggleClass("on");
				$("nav").slideToggle();
			});

			// Clic sur le bouton pour fermer la page "single-work"
			$(".single__close").on('click', function(){
				self.closePageSingleWork();
			});

			$header.css("top", -headerHeight);

			$("section:not(#single-work, .intro)").css("padding-top", headerHeight);

			// Initialisation de l'objet Form (formulaire)
			Form.init();

			// On stocke chaque projet dans l'attribut (array) "works" de l'objet Portfolio
			$.each(works, function(i, w){

	 			self.works[i] = new Work(i, w);

	 			// Une fois tous les projets récupérés
	 			if((i+1)==self.countedWorks){
	 				// On lance le chargement de la miniature du premier projet
	 				self.loadWorkThumbnail(0);
	 			}
	    	});

	    },


		/**
	    Permet de charger la miniature d'un projet, de l'incorporer à un lien, puis de rajouter celui-ci sur la page "works"
	    **/
	    loadWorkThumbnail : function( i ) {

	    	var work = this.works[i],
		    		self = this,
		    		$image = $('<img class="work-thumb__picture" alt="'+work.title+'" src="assets/img/'+ work.name +'/thumb.jpg">');

	    	// Chargement de la miniature
	    	$image.load(function() {

					// Une fois l'image chargée, création du lien vers le projet
					var $workThumb = $('<a class="work-thumb" href="#works/'+work.name+'" data-id="'+work.id +'"><div class="work-thumb__overlay"><div class="work-thumb__content"><h3 class="work-thumb__title">'+ work.title +'</h3><h4 class="work-thumb__role">'+work.role+'</h4></div></div></a>');

					// Ajout de l'image dans le lien
					$workThumb.find(".work-thumb__overlay").before($(this));
					// Ajout du lien dans la page "works"
					$workThumb.appendTo("#list-works");

					// On incrémente le nombre de projets chargés et prêts
		    	self.loadedWorks++;

		    	// On augmente la largeur de la progressbar
	    		$('.progress-bar__progression')
	    		.velocity("stop")
	    		.velocity(
					{"width" : (self.loadedWorks/self.countedWorks)*100 + '%'
					}, 200, "easeInOutBack",
					// Callback
					function(){
						// Si toutes les images n'ont pas été chargées
						if(self.loadedWorks != self.countedWorks){
							// on charge la suivante
							self.loadWorkThumbnail(i+1);

						// Sinon
						}else{
							//on appelle la fonction "hideProgressBar"
							$(this).velocity(
								{'top' : '-10px'},
								{
									complete:function(){
										$(this).css("display","none");
										self.showPageAfterLoading();
									}
								}
							);
						}
					}
				);
			});
		},

		/**
		Fonction pour afficher la bonne page en fonction de l'url de départ
		**/
		showPageAfterLoading : function(){

			var self = this,
				page = window.location.hash;

			$window.trigger("resize"); // On "simule" le redimensionnement de la fenêtre pour appeler la fonction "resizedWindow"

			if(page.length > 0){ // Si un chemin est indiqué dans l'url

				if(page.indexOf("#works/") == -1){ // L'url ne contient pas de nom de projet

					self.showPage(page); // On affiche la page "works", "about" ou "contact"

				}else{ // Sinon, si le nom d'un projet est indiqué dans l'url

					// On supprime l'introduction
					$intro.remove();

					// On surligne le lien correspondant à la page dans le menu
					$("nav ul li:nth-child(1)").addClass("active");

					// Mise à jour de la page courante
					self.currentPage = "#works";

					// On récupère le nom du projt
					var work = page.split("/");
					work = work[1];

					// On affiche le projet correspondant
					$.each(this.works, function(i, w){
						if(w.name == work){
							var id = parseInt(i) + 1;
							self.chooseWork(id);
						}
					});
				}
			}
			// Sinon on affiche l'introduction
			else{
				self.showIntro();
			}

		},

		/**
		Fonction pour afficher l'introduction avec les animations
		**/
		showIntro : function(){

			var self = this,
				$photoProfil = $intro.find(".intro__picture"),
				$textIntro = $intro.find(".intro__text"),
				$link = $intro.find(".intro__cta");

			$window.trigger("resize");

			$photoProfil.velocity({marginTop:0, opacity: 1}, 500, "ease", function(){
				$textIntro.velocity(
					{marginTop:"30px", opacity: 1},
					{
						delay:100,
						duration : 800,
						easing : "ease",
						complete : function(){
							$link.css("display", "block").delay(100).velocity({opacity: 1}, "ease", 500);
							$link.on('click', function(){
								Portfolio.leaveIntroAndEnterPortfolio()
							});
						}
					}
				);
			});
		},

		/**
		Fonction pour cacher l'intro et afficher la page
		**/
		leaveIntroAndEnterPortfolio : function() {

			this.currentPage = "#works";

			window.location.hash = "#works";

			$intro.velocity(
				{ opacity:0, marginTop: "-=15vh"  },
				{ duration:250, easing:"ease", complete: function(){

						$(this).remove();

						$header.find("nav li:first").addClass("active");

						$header.css("display", "block").velocity({"top":0}, 200, "linear");

						$("#works").css("display", "block").velocity({opacity:1}, {duration:500, delay:100 });

					}
				}
			);

		},

		/**
		Fonction pour scroller la page
		**/
	    scrollTo : function( link, time ){

			var self = this,
				time = time || 1000;

			$('html, body').animate({ scrollTop: $(link).offset().top }, time, "easeInOutExpo");

			return false;
		},

		/**
		Fonction pour redimensionner les miniatures des projets (page "works") + cacher ou non le menu version mobile
		**/
		resizedWindow : function(){

			var windowWidth  = $window.width(),
					$workThumb   = $(".works .work-thumb"),
					$wrapperInfo = $workThumb.find(".work-thumb__content"),
					$nav  = $("nav")
					wrapperInfoHeight = 50;

			// Si introduction visible ou prête à être affichée, recentrage verticle de celle-ci
			if($intro.length != 0){
				var introTopPosition = ($window.height() - $intro.height())/2;
				$intro.css("top", introTopPosition);
			}

			// Redimensionnement des container des miniatures des projets
			// $(".works .work-thumb").height($window.width() * $(".works .work-thumb").width() / 100);

			// Lorsqu'on passe du desktop au tablette/mobile, si le menu était ouvert, on le réaffiche
			if( windowWidth <= 768){
				if($toggle.hasClass("on")) {
					$nav.css("display", "block");
				} else {
					$nav.css("display", "none");
				}
			} else {// Sur desktop, le menu est toujours visible
				$nav.css("display", "block");
			}
		},


		/**
		Fonction pour afficher une page
		**/
		showPage : function( page ){

			var self = this,
				pageTitle = page.substr(0,1).toUpperCase(),
				$links = $header.find("nav li");

			window.location.hash = page;

			$links.each(function(){
				var link = $(this).find('a').attr("href");
				link == page ? $(this).addClass("active") : $(this).removeClass("active");
			});

			// L'utilisateur affiche une page directement sans voir l'introduction
			if($intro.is(":visible")){

				// On supprime l'introduction
				$intro.remove();

				// On affiche le header puis la page indiquée dans l'url
				$header.css("display", "block").velocity(
					{"top":0},
					{ duration : 1000, delay : 200, easing : "ease", complete : function(){
							$(page).css("display", "block").velocity({opacity:1}, 1000, "ease");
							self.currentPage = page;
						}
					}
				);

			}
			// Introduction déjà montrée, on cache la page courante
			else{
				$(self.currentPage).velocity({ scale : 0.95, opacity : 0 }, 200, function(){
					$(this).css({"display": "none"}).velocity({scale : 1 }, 0, function(){
						self.currentPage = page;
						$(self.currentPage).css("display", "block").velocity({opacity:1}, 250);
					});
				});
			}

			if(page == "#about"){
				self.animateSkillbars();
			}

		},


		/**
		Fonction qui se lance lorsqu'un projet a été sélectionné
		**/
		chooseWork : function( workId ){

			var self = this,
				time = 0;

			// Scroll jusqu'au haut de la page
			if($("body").scrollTop() != 0){
		 		Portfolio.scrollTo("body", 500);
		 		time = 500;
		 	}

			// Page single-work déjà affichée, on la cache, on récupère les informations pour le projet sélectionné
			if($singleWork.is(":visible")){

		 		$singleWork.velocity({"scale":0.95, "opacity":0}, {duration : 400, delay : 300, easing :"ease", complete : function(){
			 			$(this).velocity({"scale":1}, 0);
			 			Portfolio.updateWorkPage(self.works[workId-1]);
		 			}
		 		});

		 	// Sinon si on est sur la page des projets
		 	}else{

				var work = self.works[workId-1];
				if(!work.allImagesLoaded){ // Si les images du projet n'ont jamais été chargées
					// on remonte le header dynamiquement en 0.4s, la progress bar sera affichée ensuite pour indiquer le chargement des images
					$header.velocity(
						{"top": -headerHeight},
						{ duration : 400, delay : 500, easing :"ease", complete :function(){ self.updateWorkPage(work); }}
					);
				}else{ //si les images du projet n'ont pas encore été chargées
					setTimeout(function(){
						self.updateWorkPage(work)},
					time);
				}
			}
		},


		/**
		Fonction qui permet de récupérer et d'afficher les informations sur le projet sélectionné sur la page "single-work"
		**/
		updateWorkPage : function( work ){

			var id = work.id,
				works = this.works,
				$url = $singleWork.find(".single__url a"),
				$icon = $('<span class="single__icon fa"></span>');

			window.location.hash = "#works/"+work.name;

		 	$singleWork.find(".single__title").html(work.title);  // Mise à jour du titre

			// Mise à jour du lien vers le site/github
		 	$url.html("");
		 	$icon.removeClass("fa-link fa-github");

		 	if(work.url[1].length!=0){	// si l'url est indiqué
				$url.attr("href", work.url[1]);

				if(work.url[0] == "site")
				{
					$url.html("See the site");
					$icon.addClass("fa-link fa-lg");
				}
				else if(work.url[0] == "github")
				{
					$url.html("Go to Github repository");
					$icon.addClass("fa-github fa-lg");
				}

				$icon.appendTo($url);
			}

			$singleWork.find("#role").html(work.role); // Mise à jour du "rôle"
			$singleWork.find("#context").html(work.context); // Mise à jour du contexte
			$singleWork.find("#skills").html(work.skills); // Mise à jour des "compétences"
			$singleWork.find("#date").html(work.date); // Mise à jour de la date
			$singleWork.find("#presentation").html(work.presentation); // Mise à jour de la présentation

			// Mise à jour du lien "projet précédent"
			var prevWork = (id == 1) ? works[works.length-1] : works[id-2];
			$singleWork.find("#previous-work .single__link-label").html(prevWork.title);
			$singleWork.find("#previous-work").attr({"data-id" : prevWork.id, href : "#works/"+prevWork.name});

			// Mise à jour du lien "projet suivant"
			var nextWork = (id == works.length) ? works[0] : works[id];
			$singleWork.find("#next-work .single__link-label").html(nextWork.title);
			$singleWork.find("#next-work").attr({"data-id" : nextWork.id, href : "#works/"+nextWork.name});

			// Affichage des images liées au projet
			$("#wrapper-pictures").empty();
			this.workPicturesUploader.init(work);

		},

		/**
		Objet permettant de charger les images liés à un projet
		**/
		workPicturesUploader : {

			work : {},
			countedImages: 0,
			loadedImages : 0,
			allImagesLoaded : false,

			/**
			Fonction pour initialiser l'objet + charger les images
			**/
			init : function( work ){

				this.work = work;
				this.countedImages = work.gallery.length;
				this.loadedImages = 0;
				this.allImagesLoaded = work.allImagesLoaded;

				$(".progress-bar__progression").css({"display": "block", "top":"0", "width":"0"});

				var pictures = this.work.gallery;

				for(var i = 0; i < pictures.length; i++){

					var title = pictures[i].title,
						url = "assets/img/"+work.name+"/"+i+".jpg",
						image = new Image();

					$(image).attr({src:url, alt: title});

					if (image.complete || image.readyState === 4){ // Image déjà chargée
						// On l'ajoute directement sur la page
						this.addImage(title, url);
					}else{ // Sinon chargement de l'image
						$(image).one("load", this.addImage(title, url));
					}
				}
			},

			/**
			Fonction pour afficher l'image une fois chargée
			**/
			addImage : function( title, url ){

				var self = this,
					$wrapperImage = $('<div class="picture" data-sr="enter left move 50px over 1s"><h5 class="picture__title">'+title+'</h5><img class="picture__src" src="'+url+'" alt="'+title+'" /></div>');

				$wrapperImage.appendTo($("#wrapper-pictures"));

				self.loadedImages++;

				if(!(self.allImagesLoaded)){
					self.updateProgressBar();
				}else{
					if(self.loadedImages == self.countedImages){
						Portfolio.showPageSingleWork();
					}
				}

			},

			/**
			Fonction pour mettre à jour la progressbar
			**/
			updateProgressBar : function(){

				var self = this,
					loadedImages = self.loadedImages,
					countedImages = self.countedImages;

				$('.progress-bar__progression')
				.velocity("stop")
				.velocity(
					{'width' : (loadedImages/countedImages)*100 + '%'},
					300,
					"ease",
					function(){
						if(loadedImages == countedImages){
							Portfolio.works[self.work.id-1].allImagesLoaded = true;
							$(this).velocity(
								{'top' : '-10px'},
								{
									complete:function(){
										Portfolio.showPageSingleWork();
										$header.css("top", -headerHeight); // Cas où les images étaient déjà chargées
									}
								}
							);
						}
					}
				);
			}
		}, /** Fin de l'objet workPicturesUploader**/

		showPageSingleWork : function(){

			var self = this;

			$header.velocity({"opacity":"0"}, 200, "easeInSine");
			$works.velocity({"opacity":"0"}, 200, "easeInSine");

			if($window.width()>768){ // Si on est sur desktop, activation de scroll reveal
				window.scrollReveal.init(true);
			}

			$("#single-work")
			.css({"display" : "block"})
			.velocity({scale:1, opacity:1}, 400, "easeInSine");

		},

		closePageSingleWork : function(){

			window.location.hash="#works";

			$singleWork.velocity({scale :0.99, opacity:0}, 200, "ease", function(){
					$singleWork.css("display", "none");
					$header.css("display", "block").velocity({top:0, opacity:1}, 300);
					$works.css("display", "block").velocity({opacity:1}, 300);
			});

		},

		/**
		Fonction pour animer les "skillbars" de la page "about"
		**/
		animateSkillbars : function(){

			var animationDone = false,
				skillbars = $('.skill'),
				$skillsTitle = $(".about .about__title"),
				skillsTitlePosition = $skillsTitle.offset().top - parseInt($skillsTitle.css("padding-top"));

			skillbars.each(function(){
				$(this).find('.skill__bar').velocity("stop").css({"width":"0%"});
			});

			$window.on('scroll', function(){

				if($window.scrollTop() >= skillsTitlePosition && !animationDone){

					skillbars.each(function() {
						$(this).find('.skill__bar').velocity({
									width: $(this).data('percent')+"%"
								},
									5000,
									"ease"
								);
					});

					animationDone = true;
				}
			});

		}

	}
	/**********************************************/
	/********     FIN OBJET PORTFOLIO     *********/
    /**********************************************/


	/**********************************************/
	/*************     OBJET WORK     *************/
    /**********************************************/

    // Contient les informations sur un projet, sera stockée dans l'attribut "works" de l'objet "Portfolio"

	var Work = function( i, work ){

		this.id = i+1;
		this.name = work.name;
		this.title = work.title;
		this.role = work.role;
		this.context = work.context;
		this.presentation = work.presentation;
		this.skills = work.skills;
		this.date = work.date;
		this.gallery = work.gallery;
		this.allImagesLoaded = false;
		this.url = [];
		this.url.push(work.url.type);
		this.url.push(work.url.content);

	};

	/**********************************************/
	/***********     FIN OBJET WORK     ***********/
    /**********************************************/



	/**********************************************/
	/*********** FORMULAIRE PAGE CONTACT  *********/
    /**********************************************/

	var Form = {

		form : "",
		name : "",
		mail : "",
		message : "",
		emailReg : new RegExp(/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i),

		/**
		Initialisation du formulaire, des fonctions à appeler pour vérifier les champs remplis
		**/
		init : function(){

			var self = this;

			self.form = $(".form"),
			self.name = $('#form-name');
			self.name.change(function() { self.checkName(); });
			self.mail = $('#form-email');
			self.mail.change(function(){ self.checkEmail(); });
			self.message = $('#form-message');
			self.message.change(function(){ self.checkMessage(); });


			self.form.on("submit", function(e){

				e.preventDefault();

				var valid_form = self.name.val().length > 1 && self.emailReg.test(self.mail.val()) && self.message.val()!="";

				if(valid_form){
					self.sendForm();
				}else{
					self.checkForm();
				}
			});

		},

		checkName : function(){
			var $name = this.name;
			$name.val()!="" && $name.val().length < 2 ? $name.addClass("error") : $name.removeClass("error");
		},

		checkEmail : function(){
			var $email = this.mail;
			$email.val()!="" && !this.emailReg.test($email.val()) ? $email.addClass("error") : $email.removeClass("error");
		},

		checkMessage : function(){
			var $message = this.message;
			$message.removeClass("error");
		},

		checkForm : function(){

			var $name = this.name;
			var $email = this.mail;
			var $message = this.message;

			$name.val().length > 1 ? $name.removeClass("error") : $name.addClass("error");

			this.emailReg.test($email.val()) ? $email.removeClass("error") : $email.addClass("error");

			$message.val().length != 0 ? $message.removeClass("error") : $message.addClass("error");
		},

		sendForm : function(){

			var $name = this.name,
			$email = this.mail,
			$message = this.message;

			$name.removeClass("error");
			$email.removeClass("error");
			$message.removeClass("error");

			$.ajax({
				type : this.form.attr("method"),
				url : this.form.attr("action"),
				data : this.form.serialize(),
				dataType : 'json',
				success : function( json ){
					$('.form__notif').addClass("u-c-green").hide().html(json.response).slideDown("slow").delay(2000).slideUp("slow", function(){
						$('.form__notif').removeClass("u-c-green").html("");
					});

					$name.val("");
					$email.val("");
					$message.val("");
				},
				error : function( result, statut, error ){
					$('.form__notif')
						.addClass("u-c-red")
						.html("An error has occured. Please try again.")
						.slideDown("slow")
						.delay(2000)
						.slideUp()
						.removeClass("u-c-red")
						.html("");
				}
			});
		}
	}

})(jQuery)
