using System.Diagnostics.CodeAnalysis;
using System.Xml.Linq;
using VocaDb.Model.DataContracts.Tags;
using VocaDb.Model.Domain.Activityfeed;
using VocaDb.Model.Domain.Security;
using VocaDb.Model.Domain.Versioning;
using VocaDb.Model.Helpers;

namespace VocaDb.Model.Domain.Tags
{
	public class ArchivedTagVersion : ArchivedObjectVersion, IArchivedObjectVersionWithFields<TagEditableFields>
	{
		public static ArchivedTagVersion Create(Tag tag, TagDiff diff, AgentLoginData author, EntryEditEvent commonEditEvent, string notes)
		{
			var contract = new ArchivedTagContract(tag, diff);
			var data = XmlHelper.SerializeToXml(contract);

			return tag.CreateArchivedVersion(data, diff, author, commonEditEvent, notes);
		}

		private TagDiff _diff;
		private Tag _tag;

#nullable disable
		public ArchivedTagVersion()
		{
			Status = EntryStatus.Finished;
		}
#nullable enable

		public ArchivedTagVersion(
			Tag tag,
			XDocument data,
			TagDiff diff,
			AgentLoginData author,
			EntryEditEvent commonEditEvent,
			string notes
		)
			: base(data, author, tag.Version, tag.Status, notes)
		{
			ParamIs.NotNull(() => diff);

			Tag = tag;
			Diff = diff;
			CommonEditEvent = commonEditEvent;
		}

		public virtual EntryEditEvent CommonEditEvent { get; set; }

		public override IEntryDiff DiffBase => Diff;

		public virtual TagDiff Diff
		{
			get => _diff;
			[MemberNotNull(nameof(_diff))]
			set
			{
				ParamIs.NotNull(() => value);
				_diff = value;
			}
		}

		public override EntryEditEvent EditEvent => CommonEditEvent;

		public override IEntryWithNames EntryBase => Tag;

		public virtual Tag Tag
		{
			get => _tag;
			[MemberNotNull(nameof(_tag))]
			set
			{
				ParamIs.NotNull(() => value);
				_tag = value;
			}
		}

		public virtual ArchivedTagVersion? GetLatestVersionWithField(TagEditableFields field)
		{
			if (IsIncluded(field))
				return this;

			return Tag.ArchivedVersionsManager.GetLatestVersionWithField(field, Version);
		}

		public virtual bool IsIncluded(TagEditableFields field)
		{
			return Diff != null && Data != null && Diff.IsIncluded(field);
		}
	}
}
