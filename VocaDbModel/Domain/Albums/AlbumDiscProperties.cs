using System.Diagnostics.CodeAnalysis;
using VocaDb.Model.DataContracts.Albums;

namespace VocaDb.Model.Domain.Albums;

public class AlbumDiscProperties : IEntryWithIntId
{
	private Album _album;
	private string _name;

#nullable disable
	public AlbumDiscProperties()
	{
		MediaType = DiscMediaType.Audio;
	}

	public AlbumDiscProperties(Album album, AlbumDiscPropertiesContract contract)
	{
		ParamIs.NotNull(() => album);

		Album = album;
		CopyContentFrom(contract);
	}
#nullable enable

	public virtual Album Album
	{
		get => _album;
		[MemberNotNull(nameof(_album))]
		set
		{
			ParamIs.NotNull(() => value);
			_album = value;
		}
	}

	public virtual int DiscNumber { get; set; }

	public virtual int Id { get; set; }

	public virtual DiscMediaType MediaType { get; set; }

	public virtual string Name
	{
		get => _name;
		[MemberNotNull(nameof(_name))]
		set
		{
			ParamIs.NotNull(() => value);
			_name = value;
		}
	}

	public virtual void CopyContentFrom(AlbumDiscPropertiesContract contract)
	{
		ParamIs.NotNull(() => contract);

		DiscNumber = contract.DiscNumber;
		MediaType = contract.MediaType;
		Name = contract.Name;
	}
}

public enum DiscMediaType
{
	Audio,
	Video
}
