﻿using System;
using System.Linq;
using System.Web.Http;
using VocaDb.Model.Database.Queries;
using VocaDb.Model.Database.Repositories;
using VocaDb.Model.DataContracts.Albums;
using VocaDb.Model.DataContracts.ReleaseEvents;
using VocaDb.Model.DataContracts.Songs;
using VocaDb.Model.Domain;
using VocaDb.Model.Domain.Globalization;
using VocaDb.Model.Domain.Images;
using VocaDb.Model.Domain.ReleaseEvents;
using VocaDb.Model.Service;
using VocaDb.Model.Service.Paging;
using VocaDb.Model.Service.Search;
using VocaDb.Web.Helpers;
using VocaDb.Model.Service.QueryableExtenders;
using VocaDb.Model.Service.Search.Events;
using VocaDb.Web.Code.WebApi;

namespace VocaDb.Web.Controllers.Api {

	/// <summary>
	/// API queries for album release events.
	/// </summary>
	[RoutePrefix("api/releaseEvents")]
	public class ReleaseEventApiController : ApiController {

		private const int defaultMax = 10;
		private readonly EventQueries queries;
		private readonly IEventRepository repository;
		private readonly IEntryThumbPersister thumbPersister;

		public ReleaseEventApiController(EventQueries queries, IEventRepository repository, IEntryThumbPersister thumbPersister) {
			this.queries = queries;
			this.repository = repository;
			this.thumbPersister = thumbPersister;
		}

		/// <summary>
		/// Deletes an event.
		/// </summary>
		/// <param name="id">ID of the event to be deleted.</param>
		/// <param name="notes">Notes.</param>
		[Route("{id:int}")]
		[Authorize]
		public void Delete(int id, string notes = "") {

			queries.Delete(id, notes ?? string.Empty);

		}

		/// <summary>
		/// Gets a list of albums for a specific release event.
		/// </summary>
		/// <param name="eventId">Release event ID.</param>
		/// <param name="fields">List of optional album fields.</param>
		/// <param name="lang">Content language preference.</param>
		/// <returns>List of albums.</returns>
		[Route("{eventId:int}/albums")]
		public AlbumForApiContract[] GetAlbums(int eventId, 
			AlbumOptionalFields fields = AlbumOptionalFields.None, 
			ContentLanguagePreference lang = ContentLanguagePreference.Default) {
			
			return repository.HandleQuery(ctx => {
				
				var ev = ctx.Load(eventId);
				return ev.Albums.Select(a => new AlbumForApiContract(a, null, lang, thumbPersister, WebHelper.IsSSL(Request), fields, SongOptionalFields.None)).ToArray();

			});

		}

		/// <summary>
		/// Gets a page of release events.
		/// </summary>
		/// <param name="query">Event name query (optional).</param>
		/// <param name="nameMatchMode">Match mode for event name (optional, defaults to Auto).</param>
		/// <param name="seriesId">Filter by series Id.</param>
		/// <param name="afterDate">Filter by events after this date (inclusive).</param>
		/// <param name="beforeDate">Filter by events before this date (exclusive).</param>
		/// <param name="category">Filter by event category.</param>
		/// <param name="userCollectionId">Filter to include only events in user's events (interested or attending).</param>
		/// <param name="status">Filter by entry status.</param>
		/// <param name="start">First item to be retrieved (optional, defaults to 0).</param>
		/// <param name="maxResults">Maximum number of results to be loaded (optional, defaults to 10).</param>
		/// <param name="getTotalCount">Whether to load total number of items (optional, default to false).</param>
		/// <param name="sort">
		/// Sort rule (optional, defaults to Name). 
		/// Possible values are None, Name, Date, SeriesName.
		/// </param>
		/// <param name="fields">
		/// Optional fields (optional). Possible values are Description, Series.
		/// </param>
		/// <param name="lang">Content language preference.</param>
		/// <returns>Page of events.</returns>
		/// <example>http://vocadb.net/api/releaseEvents?query=Voc@loid</example>
		[Route("")]
		public PartialFindResult<ReleaseEventForApiContract> GetList(
			string query = "",
			NameMatchMode nameMatchMode = NameMatchMode.Auto,
			int seriesId = 0,
			DateTime? afterDate = null,
			DateTime? beforeDate = null,
			EventCategory category = EventCategory.Unspecified,
			int? userCollectionId = null,
			[FromUri] int[] tagId = null,
			bool childTags = false,
			EntryStatus? status = null,
			int start = 0, 
			int maxResults = defaultMax,
			bool getTotalCount = false, 
			EventSortRule sort = EventSortRule.Name,
			ReleaseEventOptionalFields fields = ReleaseEventOptionalFields.None,
			ContentLanguagePreference lang = ContentLanguagePreference.Default
			) {
			
			var textQuery = SearchTextQuery.Create(query, nameMatchMode);
			var queryParams = new EventQueryParams {
				TextQuery = textQuery,
				SeriesId = seriesId,
				AfterDate = afterDate,
				BeforeDate = beforeDate,
				Category = category,
				UserId = userCollectionId ?? 0,
				ChildTags = childTags,
				TagIds = tagId,
				EntryStatus = status,
				Paging = new PagingProperties(start, maxResults, getTotalCount),
				SortRule = sort
			};

			return queries.Find(e => new ReleaseEventForApiContract(e, lang, fields, thumbPersister, WebHelper.IsSSL(Request)), queryParams);

		}

		/// <summary>
		/// Find event names by a part of name.
		/// 
		/// Matching is done anywhere from the name.
		/// </summary>
		/// <param name="query">Event name query, for example "Voc@loid".</param>
		/// <param name="maxResults">Maximum number of search results.</param>
		/// <returns>
		/// List of event names, for example "The Voc@loid M@ster 1", matching the query. Cannot be null.
		/// </returns>
		[Route("names")]
		public string[] GetNames(
			string query = "",
			int maxResults = 10) {
			
			return repository.HandleQuery(ctx => {

				return ctx.Query<EventName>()
					.Where(n => n.Value.Contains(query))
					.OrderBy(n => n.Value)
					.Take(maxResults)
					.Select(r => r.Value)
					.ToArray();
				
			});

		}

		[Route("{id:int}")]
		public ReleaseEventForApiContract GetOne(int id, ReleaseEventOptionalFields fields, ContentLanguagePreference lang = ContentLanguagePreference.Default) {
			return queries.GetOne(id, lang, fields, WebHelper.IsSSL(Request));
		}

		/// <summary>
		/// Creates a new report.
		/// </summary>
		/// <param name="eventId">Event to be reported.</param>
		/// <param name="reportType">Report type.</param>
		/// <param name="notes">Notes. Optional.</param>
		/// <param name="versionNumber">Version to be reported. Optional.</param>
		[Route("{eventId:int}/reports")]
		[RestrictBannedIP]
		public void PostReport(int eventId, EventReportType reportType, string notes, int? versionNumber) {

			queries.CreateReport(eventId, reportType, WebHelper.GetRealHost(Request), notes ?? string.Empty, versionNumber);

		}

	}

}