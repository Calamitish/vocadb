using VocaDb.Model.Domain.Users;

namespace VocaDb.Model.Domain.Artists;

public class ArtistPictureFile : EntryPictureFile, IEntryWithIntId
{
	private Artist _artist;

#nullable disable
	public ArtistPictureFile() { }
#nullable enable

	public ArtistPictureFile(string name, string mime, User author, Artist artist)
		: base(name, mime, author)
	{
		_artist = artist;
	}

	public virtual Artist Artist
	{
		get => _artist;
		set
		{
			ParamIs.NotNull(() => value);
			_artist = value;
		}
	}

	public override EntryType EntryType => EntryType.Artist;

	public override int OwnerEntryId => Artist.Id;

	public virtual void Move(Artist target)
	{
		ParamIs.NotNull(() => target);

		if (target == Artist)
			return;

		Artist.Pictures.Remove(this);
		Artist = target;
		target.Pictures.Add(this);
	}
}
