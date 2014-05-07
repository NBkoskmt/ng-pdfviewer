/**
 * @preserve AngularJS PDF viewer directive using pdf.js.
 *
 * https://github.com/akrennmair/ng-pdfviewer
 *
 * MIT license
 */

angular.module('ngPDFViewer', []).
directive('pdfviewer', [ '$parse', '$timeout', function($parse, $timeout) {
	var canvas = null;
	var instance_id = null;

	return {
		restrict: "E",
		template: '<canvas></canvas>',
		scope: {
			onPageLoad: '&',
			loadProgress: '&',
			src: '@',
			id: '=',
			zoomLevel: '@'
		},
		controller: [ '$scope', function($scope) {
			$scope.pageNum = 1;
			$scope.pdfDoc = null;
			$scope.zoomLevel = $scope.zoomLevel || 1.0;

			$scope.documentProgress = function(progressData) {
				if ($scope.loadProgress) {
					$scope.loadProgress({state: "loading", loaded: progressData.loaded, total: progressData.total});
				}
			};

			$scope.loadPDF = function(path) {
				PDFJS.getDocument(path, null, null, $scope.documentProgress).then(function(_pdfDoc) {
					$scope.pdfDoc = _pdfDoc;
					$scope.renderPage($scope.pageNum, function(success) {
						if ($scope.loadProgress) {
							$scope.loadProgress({state: "finished", loaded: 0, total: 0});
						}
					});
				}, function(message, exception) {
					console.log("PDF load error: " + message);
					if ($scope.loadProgress) {
						$scope.loadProgress({state: "error", loaded: 0, total: 0});
					}
				});
			};

			$scope.renderPage = function(num, callback) {
				$scope.pdfDoc.getPage(num).then(function(page) {
					var scale = calculateScale(page, $scope.zoomLevel);
					var viewport = page.getViewport(scale);
					var ctx = canvas.getContext('2d');

					canvas.height = viewport.height;
					canvas.width = viewport.width;

					page.render({ canvasContext: ctx, viewport: viewport }).then(
						function() {
							if (callback) {
								callback(true);
							}
							$scope.$apply(function() {
								$scope.onPageLoad({ page: $scope.pageNum, total: $scope.pdfDoc.numPages });
							});
						},
						function() {
							if (callback) {
								callback(false);
							}
							console.log('page.render failed');
						}
					);
				});
			};

			$scope.$on('pdfviewer.nextPage', function(evt, id) {
				if (id !== instance_id) {
					return;
				}

				if ($scope.pageNum < $scope.pdfDoc.numPages) {
					$scope.pageNum++;
					$scope.renderPage($scope.pageNum);
				}
			});

			$scope.$on('pdfviewer.prevPage', function(evt, id) {
				if (id !== instance_id) {
					return;
				}

				if ($scope.pageNum > 1) {
					$scope.pageNum--;
					$scope.renderPage($scope.pageNum);
				}
			});

			$scope.$on('pdfviewer.gotoPage', function(evt, id, page) {
				if (id !== instance_id) {
					return;
				}

				if (page >= 1 && page <= $scope.pdfDoc.numPages) {
					$scope.pageNum = page;
					$scope.renderPage($scope.pageNum);
				}
			});

			$scope.$on('pdfviewer.changeZoom', function(evt, id, zoomLevel) {
				if (id !== instance_id) {
					return;
				}

				$scope.zoomLevel = zoomLevel;
				$scope.renderPage($scope.pageNum);
			});

			var calculateScale = function(page, zoomLevel) {

				if (+zoomLevel > 0) {
					return zoomLevel / 100;
				}

				var defaultViewport = page.getViewport(1.0);
				var pageWidthScale = $scope.containerWidth / defaultViewport.width;
				var pageHeightScale = $scope.containerHeight / defaultViewport.height;

				switch(zoomLevel) {
					case 'page-actual':
						scale = 1;
						break;
					case 'page-width':
						scale = pageWidthScale;
						break;
					case 'page-height':
						scale = pageHeightScale;
						break;
					case 'page-fit':
						scale = Math.min(pageWidthScale, pageHeightScale);
						break;
					default:
						console.error('Calculate scale: '+zoomLevel+' is not a valid zoom level');
				}

				return scale;
			}

		} ],
		link: function(scope, iElement, iAttr) {
			iElement.css('display', 'block');
			canvas = iElement.find('canvas')[0];
			instance_id = iAttr.id;

			iAttr.$observe('src', function(v) {
				if (v !== undefined && v !== null && v !== '') {
					scope.pageNum = 1;
					scope.loadPDF(scope.src);
				}
			});

			var setContainerSize = function() {
				var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
				var containerTopOffset = iElement[0].offsetTop;
				var verticalPadding = 5;
				scope.containerWidth = iElement[0].offsetWidth;
				scope.containerHeight = viewportHeight - containerTopOffset - verticalPadding;
			}
			setContainerSize();

			var resizePromise;
			window.onresize = function(){
				if (resizePromise) {
					$timeout.cancel(resizePromise);
				}
				resizePromise = $timeout(function() {
					setContainerSize();
					scope.renderPage(scope.pageNum);
				}, 100);
			};
		}
	};
}]).
service("PDFViewerService", [ '$rootScope', function($rootScope) {

	var svc = { };
	svc.nextPage = function() {
		$rootScope.$broadcast('pdfviewer.nextPage');
	};

	svc.prevPage = function() {
		$rootScope.$broadcast('pdfviewer.prevPage');
	};

	svc.Instance = function(id) {
		var instance_id = id;

		return {
			prevPage: function() {
				$rootScope.$broadcast('pdfviewer.prevPage', instance_id);
			},
			nextPage: function() {
				$rootScope.$broadcast('pdfviewer.nextPage', instance_id);
			},
			gotoPage: function(page) {
				$rootScope.$broadcast('pdfviewer.gotoPage', instance_id, page);
			},
			changeZoom: function(zoomLevel) {
				$rootScope.$broadcast('pdfviewer.changeZoom', instance_id, zoomLevel);
			}
		};
	};

	return svc;
}]);
