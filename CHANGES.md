# Changes

* 0.4.0:
    - Add the ability to set pageNum to 'last' to load the final page of a pdf
    - Add an instance method to manually load a pdf and page instead of using the html src attribute

* 0.3.0:
    - Add zoom features to directive
    - Add zoomLevel directive attribute
    - Add changeZoom method to PDFViewerService

* 0.2.0:
	- All viewer instances need an ID now; commands are sent to specific instances.
	- A progress callback can be specified to track download progress.
	- Provide an example.
	- Provide a source map along with the minified source code.

* 0.1.0:
	- Initial release.
