using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Service.BrandableStrings;
using VocaDb.Model.Utils;
using VocaDb.Model.Utils.Config;
using VocaDb.Web.Code.Markdown;
using VocaDb.Web.Helpers;

namespace VocaDb.Web.Code;

public abstract class VocaDbPage<TModel> : RazorPage<TModel>
{
	public BrandableStringsManager BrandableStrings => Context.RequestServices.GetRequiredService<BrandableStringsManager>();

	public VdbConfigManager Config => Context.RequestServices.GetRequiredService<VdbConfigManager>();

	/// <summary>
	/// Current language preference as integer.
	/// </summary>
	public int LanguagePreferenceInt => (int)UserContext.LanguagePreference;

	public MarkdownParser MarkdownParser => Context.RequestServices.GetRequiredService<MarkdownParser>();

	public PagePropertiesData PageProperties => PagePropertiesData.Get(ViewBag);

	private IUrlHelper Url => Context.RequestServices.GetRequiredService<IUrlHelper>();

	/// <summary>
	/// Relative path to application root.
	/// 
	/// Cannot be null or empty.
	/// If the application is installed in the root folder, for example http://vocadb.net/, this will be just "/".
	/// For http://server.com/vocadb/ this would be "/vocadb/".
	/// </summary>
	public string? RootPath => Url.Content("~/");

	public string DecimalDot(double val)
	{
		return NumberFormatHelper.DecimalDot(val);
	}

	public string ToJS(bool val)
	{
		return val ? "true" : "false";
	}

	public string ToJS(bool? val)
	{
		return val.HasValue ? (val.Value ? "true" : "false") : "null";
	}

	public string ToJS(int? val)
	{
		return val.HasValue ? val.Value.ToString() : "null";
	}

	public IHtmlContent ToJS(string? str, bool lowerCase = true, bool dateTimeConverter = false) => JsonHelpers.ToJS(str, lowerCase, dateTimeConverter);

	public IHtmlContent ToJS(object? obj, bool lowerCase = true, bool dateTimeConverter = false) => JsonHelpers.ToJS(obj, lowerCase, dateTimeConverter);

	public VocaUrlMapper UrlMapper => new();

	public IUserPermissionContext UserContext => Context.RequestServices.GetRequiredService<IUserPermissionContext>();

	// Code from: https://github.com/aspnet/AspNetWebStack/blob/749384689e027a2fcd29eb79a9137b94cea611a8/src/System.Web.WebPages/WebPageRenderingBase.cs#L178
	public string Culture => Thread.CurrentThread.CurrentCulture.Name;

	// Code from: https://github.com/aspnet/AspNetWebStack/blob/749384689e027a2fcd29eb79a9137b94cea611a8/src/System.Web.WebPages/WebPageRenderingBase.cs#L192
	public string UICulture => Thread.CurrentThread.CurrentUICulture.Name;
}

public abstract class VocaDbPage : RazorPage
{
	public BrandableStringsManager BrandableStrings => Context.RequestServices.GetRequiredService<BrandableStringsManager>();

	public VdbConfigManager Config => Context.RequestServices.GetRequiredService<VdbConfigManager>();

	public int LanguagePreferenceInt => (int)UserContext.LanguagePreference;

	public PagePropertiesData PageProperties => PagePropertiesData.Get(ViewBag);

	private IUrlHelper Url => Context.RequestServices.GetRequiredService<IUrlHelper>();

	public string? RootPath => Url.Content("~/");

	public string ToJS(bool val)
	{
		return val ? "true" : "false";
	}

	public string ToJS(bool? val)
	{
		return val.HasValue ? ToJS(val.Value) : "null";
	}

	public string ToJS(int? val)
	{
		return val.HasValue ? val.Value.ToString() : "null";
	}

	public IHtmlContent ToJS(string? str, bool lowerCase = true, bool dateTimeConverter = false) => JsonHelpers.ToJS(str, lowerCase, dateTimeConverter);

	public IHtmlContent ToJS(object? obj, bool lowerCase = true, bool dateTimeConverter = false) => JsonHelpers.ToJS(obj, lowerCase, dateTimeConverter);

	public VocaUrlMapper UrlMapper => new();

	public IUserPermissionContext UserContext => Context.RequestServices.GetRequiredService<IUserPermissionContext>();

	// Code from: https://github.com/aspnet/AspNetWebStack/blob/749384689e027a2fcd29eb79a9137b94cea611a8/src/System.Web.WebPages/WebPageRenderingBase.cs#L178
	public string Culture => Thread.CurrentThread.CurrentCulture.Name;

	// Code from: https://github.com/aspnet/AspNetWebStack/blob/749384689e027a2fcd29eb79a9137b94cea611a8/src/System.Web.WebPages/WebPageRenderingBase.cs#L192
	public string UICulture => Thread.CurrentThread.CurrentUICulture.Name;
}
