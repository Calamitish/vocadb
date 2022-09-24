using System.Web;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace VocaDb.Web.Helpers;

public static class JsonHelpers
{
	public static string Serialize(object? value, bool lowerCase = true, bool dateTimeConverter = false)
	{
		var settings = new JsonSerializerSettings();

		if (lowerCase)
			settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

		if (dateTimeConverter)
			settings.Converters = new[] { new JavaScriptDateTimeConverter() };

		return JsonConvert.SerializeObject(value, Formatting.None, settings);
	}

	/// <summary>
	/// <seealso href="https://github.com/VocaDB/vocadb/pull/736"/>
	/// </summary>
	public static IHtmlContent ToJS(object? value, bool lowerCase = true, bool dateTimeConverter = false)
	{
		return new HtmlString($@"JSON.parse(""{HttpUtility.JavaScriptStringEncode(Serialize(value, lowerCase, dateTimeConverter))}"")");
	}
}