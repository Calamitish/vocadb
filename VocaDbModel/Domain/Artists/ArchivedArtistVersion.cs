using System.Diagnostics.CodeAnalysis;
using System.Xml.Linq;
using VocaDb.Model.DataContracts.Artists;
using VocaDb.Model.Domain.Activityfeed;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Domain.Versioning;
using VocaDb.Model.Helpers;

namespace VocaDb.Model.Domain.Artists
{
	public class ArchivedArtistVersion : ArchivedObjectVersion, IArchivedObjectVersionWithFields<ArtistEditableFields>
	{
		public static ArchivedArtistVersion Create(Artist artist, ArtistDiff diff, AgentLoginData author, ArtistArchiveReason reason, string notes)
		{
			var contract = new ArchivedArtistContract(artist, diff);
			var data = XmlHelper.SerializeToXml(contract);

			return artist.CreateArchivedVersion(data, diff, author, reason, notes);
		}

		private Artist _artist;
		private ArtistDiff _diff;

#nullable disable
		public ArchivedArtistVersion() { }
#nullable enable

		public ArchivedArtistVersion(
			Artist artist,
			XDocument data,
			ArtistDiff diff,
			AgentLoginData author,
			int version,
			EntryStatus status,
			ArtistArchiveReason reason,
			string notes
		)
			: base(data, author, version, status, notes)
		{
			ParamIs.NotNull(() => data);

			Artist = artist;
			Diff = diff;
			Reason = reason;

			if (diff.IncludePicture)
			{
				Picture = artist.Picture;
				PictureMime = artist.PictureMime;
			}
		}

		public virtual Artist Artist
		{
			get => _artist;
			[MemberNotNull(nameof(_artist))]
			protected set
			{
				ParamIs.NotNull(() => value);
				_artist = value;
			}
		}

		public virtual ArtistDiff Diff
		{
			get => _diff;
			[MemberNotNull(nameof(_diff))]
			protected set => _diff = value;
		}

		public override IEntryDiff DiffBase => Diff;

		public override EntryEditEvent EditEvent => Reason == ArtistArchiveReason.Created ? EntryEditEvent.Created : EntryEditEvent.Updated;

		public override IEntryWithNames EntryBase => Artist;

#nullable disable
		public virtual PictureData Picture { get; set; }
#nullable enable

		public virtual string? PictureMime { get; set; }

		public virtual ArtistArchiveReason Reason { get; set; }

		public virtual ArchivedArtistVersion? GetLatestVersionWithField(ArtistEditableFields field)
		{
			if (IsIncluded(field))
				return this;

			return Artist.ArchivedVersionsManager.GetLatestVersionWithField(field, Version);
		}

		public virtual bool IsIncluded(ArtistEditableFields field)
		{
			return Diff != null && Data != null && Diff.IsIncluded(field);
		}
	}
}
