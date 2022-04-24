#nullable disable

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VocaDb.Model.Database.Queries;
using VocaDb.Model.DataContracts.Venues;
using VocaDb.Model.Domain;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Domain.Venues;
using VocaDb.Model.Service.Translations;
using VocaDb.Web.Code;
using VocaDb.Web.Code.Markdown;
using VocaDb.Web.Models.Shared;
using VocaDb.Web.Models.Venue;

namespace VocaDb.Web.Controllers
{
	public class VenueController : ControllerBase
	{
		private readonly IEnumTranslations _enumTranslations;
		private readonly VenueQueries _queries;
		private readonly MarkdownParser _markdownParser;

		public VenueController(VenueQueries queries, IEnumTranslations enumTranslations, MarkdownParser markdownParser)
		{
			_queries = queries;
			_enumTranslations = enumTranslations;
			_markdownParser = markdownParser;
		}

		public ActionResult Details(int id = InvalidId)
		{
			var venue = _queries.GetDetails(id);

			PageProperties.Title = venue.Name;
			PageProperties.Subtitle = ViewRes.Venue.DetailsStrings.Venue;

			var descriptionStripped = _markdownParser.GetPlainText(venue.Description);

			PageProperties.Description = descriptionStripped;
			PageProperties.Robots = venue.Deleted ? PagePropertiesData.Robots_Noindex_Follow : string.Empty;

			return View("React/Index");
		}

		[Authorize]
		public ActionResult Edit(int? id)
		{
			if (id.HasValue)
			{
				CheckConcurrentEdit(EntryType.Venue, id.Value);
			}

			var contract = id.HasValue ? _queries.GetForEdit(id.Value) : new VenueForEditContract();
			return View(new VenueEditViewModel(contract, PermissionContext));
		}

		[HttpPost]
		[Authorize]
		public ActionResult Edit(VenueEditViewModel model)
		{
			// Note: name is allowed to be whitespace, but not empty.
			if (model.Names == null || model.Names.All(n => string.IsNullOrEmpty(n?.Value)))
			{
				ModelState.AddModelError("Names", "Name cannot be empty");
			}

			if ((model.Coordinates != null) && !OptionalGeoPoint.IsValid(model.Coordinates.Latitude, model.Coordinates.Longitude))
			{
				ModelState.AddModelError("Coordinates", "Invalid coordinates");
			}

			if (!ModelState.IsValid)
			{
				model.AllowedEntryStatuses = EntryPermissionManager.AllowedEntryStatuses(PermissionContext).ToArray();
				return View(model);
			}

			var id = _queries.Update(model.ToContract());

			return RedirectToAction("Details", new { id });
		}

		public ActionResult Restore(int id)
		{
			_queries.Restore(id);

			return RedirectToAction("Edit", new { id });
		}

		public ActionResult UpdateVersionVisibility(int archivedVersionId, bool hidden)
		{
			_queries.UpdateVersionVisibility<ArchivedVenueVersion>(archivedVersionId, hidden);

			return RedirectToAction("ViewVersion", new { id = archivedVersionId });
		}

		public ActionResult Versions(int id = InvalidId)
		{
			var contract = _queries.GetWithArchivedVersions(id);

			PageProperties.Title = ViewRes.EntryDetailsStrings.Revisions + " - " + contract.Name;
			PageProperties.Robots = PagePropertiesData.Robots_Noindex_Nofollow;

			return View("React/Index");
		}

		public ActionResult ViewVersion(int id, int? ComparedVersionId)
		{
			var contract = _queries.GetVersionDetails(id, ComparedVersionId ?? 0);

			PageProperties.Title = "Revision " + contract.ArchivedVersion.Version + " for " + contract.Name;
			PageProperties.Robots = PagePropertiesData.Robots_Noindex_Nofollow;

			return View(new ViewVersion<ArchivedVenueVersionDetailsContract>(contract, _enumTranslations, contract.ComparedVersionId));
		}
	}
}