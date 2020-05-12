    
/* Magic Mirror
 * Module: brewview
 *
 * By fxwalsh
 * MIT Licensed.
 */

Module.register("brewview",{

	// Default module config.
	defaults: {
		text: "Brewview"
	},

	getTemplate: function () {
		return "brewview.njk";
	},

	getTemplateData: function () {
		return this.config;
	}
});