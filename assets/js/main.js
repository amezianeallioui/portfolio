(function($) {

	// 'use strict'

	var configScrollreveal = {
			mobile: false,
			init: false
		},
		$loader = $("#loader"),
		$header = $("header"),
		$intro = $("#introduction"),
		$about = $("#about"),
		$works = $("#works"),
		$singleWork = $("#single-work"),
		$contact = $("#contact"),
		headerHeight = $header.outerHeight();

	$.getJSON("works.json", function(result){
		// Affichage des sites
		Portfolio.init(result);
	});

	$(window).resize(function(){
		Portfolio.resizeContent();
	});

	$("#enter-portfolio").on('click', function(){
		Portfolio.enterPortfolio();
	});
			
	$("#close-work").on('click', function(){
		Portfolio.closeWork();
	});

	$("#toggle").on('click', function(){
		$(this).toggleClass("on");
		$("#navigation").slideToggle();
	});

	// Mettre en place data-id, pour permettre aux liens avec réels href de s'ouvrir normalemnt

	$('body').on('click', 'a', function(e){

		e.preventDefault();

		// Cas 1 : lien href
		
		if($(this).attr("href")){

			var link = $(this).attr("href");

			if(link.indexOf('#') > -1){
				Portfolio.scrollTo(link);
			}else if(link.indexOf("http") == -1){
				Portfolio.showPage(link);	
			}else{
				window.open(link);
			}
		}
		// Cas 2 : lien vers projet
		else if($(this).data("id")){
			// on récupère la valeur "id" du lien cliqué 
			var id = e.currentTarget.dataset.id;
			Portfolio.showWork(id);
		}

	});


	$(function(){

		$(window).trigger("resize");

		window.scrollReveal = new scrollReveal(configScrollreveal);
		
		Form.init();

	});

	var Portfolio = {

		currentPage : "",
		works : [],
		countedWorks : 0,
		loadedWorks : 0,

		init : function(works){

			$header.css("top", -headerHeight);

			$("section").css("padding-top", headerHeight);

			var self = this;

			this.countedWorks = works.length;

	    	$.each(works, function(i, w){
	 			self.works[i] = new Work(i, w);

	 			if((i+1)==self.countedWorks){
	 				self.loadProjectThumb(0);
	 			}
	    	});	

	    },

	    loadProjectThumb : function(i) {

	    	var work = this.works[i],
	    		self = this;

	    	$('<img alt="'+work.title+'" src="assets/img/'+ work.name+'/thumb.jpg">').load(function(){


				// Création du lien vers le projet
			
				var $workThumb = $('<a class="work" data-id="'+work.id +'"><div><span class="title">'+ work.title +'</span></div></a>');
				// Ajout de l'image dans le lien
				$workThumb.find("div").before($(this));
				// Ajout du lien dans la page "works"
				$workThumb.appendTo("#wrapper-works");

		    	self.loadedWorks++;

	    		$('#progress-bar')
	    		.velocity("stop")
	    		.velocity(
					{"width" : (self.loadedWorks/self.countedWorks)*100 + '%'},
					{
						duration : 200, 
						easing:"easeInOutBack", 
						complete: function(){
							if(self.loadedWorks != self.countedWorks){
								self.loadProjectThumb(i+1);
							}else{
								$(this).velocity(
									{'top' : '-10px'},
									{ 	
										complete:function(){
											$(this).css("display","none");
											self.showIntro();

										}
									}
								);
							}
						}
					}
				); 

			});
		},

		resizeContent : function(){

			if($intro.length != 0){
				var introTopPosition = ($(window).height() - $intro.height())/2;
				$intro.css("top", introTopPosition); 
			}

			// Redimensionnement des container des miniatures des projets
			$(".works .work").height($(".works .work").width());

			if($(window).width()<=768){
				$("#navigation").css("display", "none");
			}else{
				$("#navigation").css("display", "block");
				$("#toggle").removeClass("on");
			}
		},

		showIntro : function(){

			var self = this;

			$intro.velocity({opacity: 1}, 500, function(){
				$(this).on('click', '#enter-portfolio', self.enterPortfolio);
			});
		},

		enterPortfolio : function() {

			/* this serait égal à l'élément sur lequel on a cliqué pour appeler cette fonction */ 
			var self = Portfolio;

			self.currentPage = "about";

			$intro.velocity(
				{ opacity:0, marginTop: "-=15vh"  },
				{ duration:250, easing:"ease", complete: function(){

						$intro.remove();
							
						$header.find("#navigation li:first").addClass("active");
						
						$header.css("display", "block").velocity({"top":0}, 200, "linear");
						
						$("#about")
						.css("display", "block")
						.delay(100)
						.velocity(
							{opacity:1}, 
							{duration:500, delay:100 }
						);

					}
				}
			);	

		},

		showPage : function(newPage){

			var self = this;

			$header.find("#navigation li").each(function(){
				$(this).find('a').attr("href") == newPage ? $(this).addClass("active") : $(this).removeClass("active");
			});

			// On cache la page visible
			$("#"+self.currentPage)
			.velocity(
				{ scale : 0.98, opacity : 0 }, 
				{ 
					duration : 200,  
					// easing : "easeInOutBack", 
					complete: function(){

						self.currentPage = newPage;

						$(this).css({"display": "none"}).velocity({scale :1 }, 0, function(){
							
							// Ensuite, on affiche la page passée en paramètre
							$("#"+self.currentPage).css("display", "block").velocity(
								{opacity:1}, 
								{	
									duration:250
								}
							);
						});
					}
				}
			);

		},

		showWork : function(workId){

			console.log("show Work workId :"+ workId);

			var self = this;

			// Page single-work déjà affichée, on la cache, on récupère les informations pour le projet sélectionné
			if($singleWork.css("display") == "block"){

		 		$singleWork.velocity({"scale":0.95, "opacity":0}, 300, "ease", function(){
			 			$(this).velocity({"scale":1}, 0);
			 			Portfolio.prepareSingleWorkPage(self.works[workId-1]);
		 			}
		 		);
		 	// Sinon on scroll jusqu'en haut de la page
		 	}else{
		 		Portfolio.scrollTo("body", 500, workId);
		 	}

		},

		scrollTo : function(link, time, workId){

			var self = this;

			var time = time || 1000;

			var workId = workId || null;

			$('body, html')
			.animate({ scrollTop: $(link).offset().top }, time, "easeInOutExpo")
			// Utilisation du promise+then, en appliquant l'animation sur body et html, le callback est déclenché 2 fois
			.promise()
    		.then(function(){

				if(workId != null){
					var work = self.works[workId-1];
					if(!work.allImagesLoaded){
						$header.velocity(
							{"top": -headerHeight}, 
							400, 
							"ease", 
							function(){
								self.prepareSingleWorkPage(work);
							}
						);
					}else{
						self.prepareSingleWorkPage(work);
						// On remonte le header une fois que la page "works" disparait 
						setTimeout(function () {
							$header.css("top", -headerHeight);
						}, 500);
					}
				}
			});
			return false;
		},

		prepareSingleWorkPage : function(work){

			console.log(work);

			var id = work.id,
				works = this.works,
				$url = $singleWork.find("#url a"),
				$icon = $("<i></i>");

		 	$singleWork.find("#title").html(work.title);
		 				
			$url.attr("href", work.url[1]);

			if(work.url[0] == "site")
			{
				$url.html("See the site");
				$icon.addClass("fa fa-link fa-lg");
			}
			else if(work.url[0] == "github")
			{
				$url.html("Go to Github repository");
				$icon.addClass("fa fa-github fa-lg");
			}

			$icon.appendTo($url);

			$singleWork.find("#description").html(work.description);
			$singleWork.find("#role").html(work.role);
			$singleWork.find("#technologies").html(work.technologies);
			$singleWork.find("#date").html(work.date);
			$singleWork.find("#presentation").html(work.presentation);

			var prevWork = (id == 1) ? works[works.length-1] : works[id-2];
			$singleWork.find("#previous-work .legend-array span").html(prevWork.title);
			$singleWork.find("#previous-work").attr("data-id", prevWork.id);
			
			var nextWork = (id == works.length) ? works[0] : works[id];
			$singleWork.find("#next-work .legend-array span").html(nextWork.title);
			$singleWork.find("#next-work").attr("data-id", nextWork.id);

			this.workPicturesUploader.init(work);

		},

		workPicturesUploader : {

			work : null,
			countedImages: 0,
			loadedImages : 0,
			allImagesLoaded : false,

			init : function(work){

				this.work = work;
				this.countedImages = work.gallery.length;
				this.loadedImages = 0;
				this.allImagesLoaded = work.allImagesLoaded;

				$("#wrapper-pictures").empty();
				$("#progress-bar").css({"display": "block", "top":"0", "width":"0"});

				var pictures = this.work.gallery;

				for(var i = 0; i < pictures.length; i++){

					var title = pictures[i].title;
					var url = "assets/img/"+work.name+"/"+pictures[i].url+".jpg";

					var image = new Image();

					$(image).attr({src:url, alt: title});

					if (image.complete || image.readyState === 4){
						this.addImage(title, url);
					}else{
						$(image).one("load", this.addImage(title, url));
					}
				}
			}, 

			addImage : function(title, url){

				var self = this;

				var $wrapperImage = $('<div class="picture" data-sr="enter left move 50px over 1s"><h5>'+title+'</h5><img src="'+url+'" alt="'+title+'" /></div>');

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

			updateProgressBar : function(){

				var self = this;

				var loadedImages = self.loadedImages, 
				countedImages = self.countedImages;

				$('#progress-bar')
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
									}
								}
							);
						}	
					}
				);
			}
		},

		showPageSingleWork : function(){

			var self = this;
			
			$header.velocity({"opacity":"0"}, 200, "easeInSine");
			$works.velocity({"opacity":"0"}, 200, "easeInSine");
			
			window.scrollReveal.init(true); 

			$("#single-work")
			.css({"display" : "block"})
			.delay(100)
			.velocity({scale:1, opacity:1}, 400, "easeInSine");
		
			$(document).one('keyup', function(e){
				// Escape
				if (e.keyCode == 27) { 
					self.closeWork(); // Go back to home
				// Left arrow
				}else if(e.keyCode == 37){ 
					$('#previous-work').trigger("click");
				// Right arrow
				}else if(e.keyCode == 39){
					$('#next-work').trigger("click");
				}
			});
		},

		closeWork : function(){
			$singleWork.velocity({scale :0.99, opacity:0}, 200, "ease", function(){
					$singleWork.css("display", "none");
					$header.velocity({top:0, opacity:1}, 300);
					$works.velocity({opacity:1}, 300);
			});

		}

	}
	
	var Work = function(i, work){

		this.id = i+1;
		this.name = work.name;
		this.title = work.title;
		this.description = work.description;
		this.role = work.role;
		this.presentation = work.presentation;
		this.technologies = work.technologies;
		this.date = work.date;
		this.gallery = work.gallery;
		this.allImagesLoaded = false;
		this.url = [];
		this.url.push(work.url.type);
		this.url.push(work.url.content);
	};

	/*************/
	/* PAGE SINGLE-WORK */
	/*************/

	// var $navigation = $(".navigation"),
	// limit = 90;

	// $(window).on('scroll', function(){

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

	var Form = {

		form : "",
		name : "",
		mail : "",
		message : "",
		emailReg : new RegExp(/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i),

		init : function(){

			var self = this;

			self.name = $('#form-name');
			self.name.change(function() { self.checkName(); });
			self.mail = $('#form-email');
			self.mail.change(function(){ self.checkEmail(); });
			self.message = $('#form-message');
			self.message.change(function(){ self.checkMessage(); });

			self.form = $("#form");

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
			var emailReg = new RegExp(/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i);
			var $email = this.mail;
			$email.val()!="" && !emailReg.test($email.val()) ? $email.addClass("error") : $email.removeClass("error");
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
			$message = this.mail;

			$name.removeClass("error");
			$email.removeClass("error");
			$message.removeClass("error");

			$.ajax({
				type : this.form.attr("method"),
				url : this.form.attr("action"),
				data : this.form.serialize(),
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
	}




})(jQuery)