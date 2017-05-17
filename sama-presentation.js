(function($, angular) {
    var module = angular.module('sama-presentation', []);
			
    module.constant('DIRECTION', {
        UP: 'up',
        RIGHT: 'right',
        DOWN: 'down',
        LEFT: 'left'
    });
    
    module.component('samaNavigation', {
        template:
            // top
            '<div class="nav-strip top" ng-click="$ctrl.onClick($ctrl.UP)">' +
                '<div class="arrow-up"></div>' +
            '</div>' +
            
            // right
            '<div class="nav-strip right" ng-click="$ctrl.onClick($ctrl.RIGHT)">' +
                '<div class="arrow-right"></div>' +
            '</div>' +
            
            // bottom
            '<div class="nav-strip bottom" ng-click="$ctrl.onClick($ctrl.DOWN)">' +
                '<div class="arrow-down"></div>' +
            '</div>' +
            
            // left
            '<div class="nav-strip left" ng-click="$ctrl.onClick($ctrl.LEFT)">' +
                '<div class="arrow-left"></div>' +
            '</div>',
        bindings: {
            onNavigation: '&?'
        },
        controller: ['DIRECTION', function(DIRECTION) {
            var $ctrl = this;
            
            $ctrl.UP = DIRECTION.UP;
            $ctrl.RIGHT = DIRECTION.RIGHT;
            $ctrl.DOWN = DIRECTION.DOWN;
            $ctrl.LEFT = DIRECTION.LEFT;
            
            $ctrl.onClick = function(direction) {
                $ctrl.onNavigation({ direction: direction });
            };
        }]
    });
    
    module.component('samaPresentation', {
        template:
            '<div ng-transclude></div>' +
            '<sama-navigation on-navigation="$ctrl.navigate(direction)"></sama-navigation>',
        transclude: true,
        bindings: {
            startSlide: '@',
            animationTime: '@'
        },
        controller: ['DIRECTION', '$window', '$document', '$timeout', function(DIRECTION, $window, $document, $timeout) {
            var $ctrl = this;
            
            $ctrl.slides = {};
            $ctrl.currentSlideCtrl = null;
            
            $ctrl.api = {
                registerSlide: function(slideController) {
                    $ctrl.slides[slideController.id] = slideController;
                    
                    if (slideController.id === $ctrl.startSlide) {
                        showSlide(slideController.id);
                        
                        $ctrl.currentSlideCtrl = slideController;
                    } else {
                        hideSlide(slideController.id);
                    }
                }
            };
            
            $ctrl.keyPressed = null;
            
            $ctrl.$onInit = function() {
                $document.on('keydown', function(event) {
                    if (!$ctrl.keyPressed) {
                        $timeout(function() {
                            switch (event.key) {
                                case 'ArrowUp':
                                    $ctrl.navigate(DIRECTION.UP);
                                    
                                    break;
                                case 'ArrowRight':
                                    $ctrl.navigate(DIRECTION.RIGHT);
                                    
                                    break;
                                case 'ArrowDown':
                                    $ctrl.navigate(DIRECTION.DOWN);
                                    
                                    break;
                                case 'ArrowLeft':
                                    $ctrl.navigate(DIRECTION.LEFT);
                                    
                                    break;
                            }  
                        });
                    }
                    
                    $ctrl.keyPressed = event.key;
                });
                
                $document.on('keyup', function(event) {
                    if (event.key === $ctrl.keyPressed) {
                        $ctrl.keyPressed = null;
                    }
                });
            };
            
            var getSlideById = function(id) {
                return $('sama-slide[slide-id="' + id + '"]');
            };
            
            var hideSlide = function(id) {
                getSlideById(id).hide();
            };
            
            var showSlide = function(id) {
                getSlideById(id).show();
            };
            
            $ctrl.navigate = function(direction) {
                var nextSlideCtrl = null;
                
                switch (direction) {
                    case DIRECTION.UP:
                        nextSlideCtrl = $ctrl.slides[$ctrl.currentSlideCtrl.slideUp];
                        
                        break;
                    case DIRECTION.RIGHT:
                        nextSlideCtrl = $ctrl.slides[$ctrl.currentSlideCtrl.slideRight];
                        
                        break;
                    case DIRECTION.DOWN:
                        nextSlideCtrl = $ctrl.slides[$ctrl.currentSlideCtrl.slideDown];
                        
                        break;
                    case DIRECTION.LEFT:
                        nextSlideCtrl = $ctrl.slides[$ctrl.currentSlideCtrl.slideLeft];
                        
                        break;
                    default:
                        throw new Error('Please use the DIRECTION constant');
                }
                
                if (nextSlideCtrl) {
                    $ctrl.switchToSlide(nextSlideCtrl, direction);
                }
            };
            
            $ctrl.switchToSlide = function(nextSlideCtrl, direction) {
                var currentSlide = getSlideById($ctrl.currentSlideCtrl.id);
                var nextSlide = getSlideById(nextSlideCtrl.id);
                
                var startPositionNextSlide;
                var endPositionCurrentSlide;
                
                var window = angular.element($window);
                
                switch(direction) {
                    case DIRECTION.UP:
                        startPositionNextSlide = {
                            top: -window.height(),
                            bottom: window.height(),
                            left: 0,
                            right: 0
                        };
                        
                        endPositionCurrentSlide = {
                            top: window.height(),
                            bottom: -window.height()
                        };
                        
                        break;
                    case DIRECTION.RIGHT:
                        startPositionNextSlide = {
                            right: -window.width(),
                            left: window.width(),
                            top: 0,
                            bottom: 0
                        };
                        
                        endPositionCurrentSlide = {
                            right: window.width(),
                            left: -window.width()
                        };
                        
                        break;
                    case DIRECTION.DOWN:
                        startPositionNextSlide = {
                            top: window.height(),
                            bottom: -window.height(),
                            left: 0,
                            right: 0
                        };
                        
                        endPositionCurrentSlide = {
                            top: -window.height(),
                            bottom: window.height()
                        };
                        
                        break;
                    case DIRECTION.LEFT:
                        startPositionNextSlide = {
                            right: window.width(),
                            left: -window.width(),
                            top: 0,
                            bottom: 0
                        };
                        
                        endPositionCurrentSlide = {
                            right: -window.width(),
                            left: window.width()
                        };
                        
                        break;
                    default:
                        throw new Error('Please use the DIRECTION constant');
                }
                
                var animationTime = parseInt($ctrl.animationTime || '1000', 10);
                
                nextSlide.css(startPositionNextSlide);
                showSlide(nextSlideCtrl.id);
                
                nextSlide
                    .animate({
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }, animationTime);
                    
                currentSlide
                    .animate(
                        endPositionCurrentSlide,
                        {
                            duration: animationTime,
                            done: function() {
                                hideSlide($ctrl.currentSlideCtrl.id);
                                $ctrl.currentSlideCtrl = nextSlideCtrl;
                            }
                        }
                    );
            };
        }]
    });
    
    module.component('samaSlide', {
        template:
            '<div ng-transclude></div>',
        transclude: true,
        require: {
            presentationCtrl: '^^samaPresentation'
        },
        bindings: {
            id: '@slideId',
            slideUp: '@',
            slideRight: '@',
            slideDown: '@',
            slideLeft: '@'
        },
        controller: [function() {
            var $ctrl = this;
            
            $ctrl.$onInit = function() {
                $ctrl.presentationCtrl.api.registerSlide($ctrl);
            };
        }]
    });
})($, angular);