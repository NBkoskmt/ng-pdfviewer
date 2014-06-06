# ng-pdfviewer

AngularJS PDF viewer directive using pdf.js.

``` html
<button ng-click="prevPage()">&lt;</button>
<button ng-click="nextPage()">&gt;</button>
<br>
<span>{{currentPage}}/{{totalPages}}</span>
<br>
<pdfviewer src="test.pdf" on-page-load='pageLoaded(page,total)' id="viewer" zoomLevel="page-fit"></pdfviewer>
```

and in your AngularJS code:

``` js

var app = angular.module('testApp', [ 'ngPDFViewer' ]);

app.controller('TestCtrl', [ '$scope', 'PDFViewerService', function($scope, pdf) {
	$scope.viewer = pdf.Instance("viewer");

	$scope.nextPage = function() {
		$scope.viewer.nextPage();
	};

	$scope.prevPage = function() {
		$scope.viewer.prevPage();
	};

	$scope.pageLoaded = function(curPage, totalPages) {
		$scope.currentPage = curPage;
		$scope.totalPages = totalPages;
	};

	$scope.changeZoom = function(zoomLevel) {
		$scope.viewer.changeZoom(zoomLevel);
	};
}]);
```

## Zoom options
You can specify some standard zoom options via the `zoomLevel` directive attribute or via the viewer instance method `changeZoom()`.

Acceptable zoom levels are:
- `page-actual` Equivalent to 100%
- `page-width` Make the pdf width the same width as the directive
- `page-height` Make the pdf height the same height as the directive
- `page-fit` Make the pdf fit inside the directive dimenions
- Zoom percentage. A value of `200` will display the pdf at 200% of actual size.

## PDF loading options
Instead of using the `src` attribute in the pdfviewer directive, you can manually load a PDF as well as optionally specifying a particular page to initially load. The value `last` is an acceptable page value to select the final page of the newly loaded pdf.

``` js
app.controller('TestCtrl', [ '$scope', 'PDFViewerService', function($scope, pdf) {
	...
	$scope.loadPdfFinalPage = function(pathToPdf) {
		$scope.viewer.loadPdf(pathToPdf, 'last');
	}
	...
}]);
```

## Requirements

* AngularJS (http://angularjs.org/)
* PDF.js (http://mozilla.github.io/pdf.js/)

## Usage

Include `ng-pdfviewer.js` as JavaScript file, along with `pdf.js` and `pdf.compat.js`.

Declare `ngPDFViewer` as dependency to your module.

You can now use the `pdfviewer` tag in your HTML source.

## License

MIT. See LICENSE.md for further details.

## Author

Dominic English

Forked from:
Andreas Krennmair <ak@synflood.at>
