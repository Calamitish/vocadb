using System.Diagnostics.CodeAnalysis;
using VocaDb.Model.Domain.Globalization;

namespace VocaDb.Model.Domain.Users;

/// <summary>
/// Various additional properties for user that are not needed in most cases.
/// For example, for authentication and user profile.
/// </summary>
public class UserOptions : IDatabaseObject
{
	private string _aboutMe;
	private string _albumFormatString;
	private string _lastLoginAddress;
	private string _location;
	private string _oauthToken;
	private string _oauthTokenSecret;
	private string _realname;
	private string _twitterName;
	private User _user;
	private OptionalCultureCode? _lastLoginCulture;

#nullable disable
	public UserOptions()
	{
		LastLoginAddress
			= AboutMe
			= AlbumFormatString
			= Location
			= Realname
			= TwitterName = TwitterOAuthToken = TwitterOAuthTokenSecret
			= CustomTitle
			= string.Empty;

		LastLoginCulture = OptionalCultureCode.Empty;
		PublicAlbumCollection = true;
		PublicRatings = true;
		ShowChatbox = true;
		EmailVerified = false;
		UnreadNotificationsToKeep = 10;
	}
#nullable enable

	public UserOptions(User user)
		: this()
	{
		User = user;
	}

	public virtual string AboutMe
	{
		get => _aboutMe;
		[MemberNotNull(nameof(_aboutMe))]
		set
		{
			ParamIs.NotNull(() => value);
			_aboutMe = value;
		}
	}

	public virtual string AlbumFormatString
	{
		get => _albumFormatString;
		[MemberNotNull(nameof(_albumFormatString))]
		set
		{
			ParamIs.NotNull(() => value);
			_albumFormatString = value;
		}
	}

	public virtual string CustomTitle { get; set; }

	public virtual bool EmailVerified { get; set; }

	public virtual int Id { get; set; }

	public virtual OptionalCultureCode LastLoginCulture
	{
		get => _lastLoginCulture ??= new OptionalCultureCode();
		set
		{
			_lastLoginCulture = value ?? OptionalCultureCode.Empty;
		}
	}

	public virtual string LastLoginAddress
	{
		get => _lastLoginAddress;
		[MemberNotNull(nameof(_lastLoginAddress))]
		set
		{
			ParamIs.NotNull(() => value);
			_lastLoginAddress = value;
		}
	}

	public virtual string Location
	{
		get => _location;
		[MemberNotNull(nameof(_location))]
		set
		{
			ParamIs.NotNull(() => value);
			_location = value;
		}
	}

	/// <summary>
	/// Poisoned accounts cause the user logging in to be banned.
	/// </summary>
	public virtual bool Poisoned { get; set; }

	/// <summary>
	/// Allow others to see this user's album collection (ownership status and media type).
	/// </summary>
	public virtual bool PublicAlbumCollection { get; set; }

	/// <summary>
	/// Allow anyone to see user's album and song ratings. 
	/// Essentially this determines whether the user will appear in the "album in collections" and "song ratings" popups.
	/// </summary>
	public virtual bool PublicRatings { get; set; }

	public virtual string Realname
	{
		get => _realname;
		[MemberNotNull(nameof(_realname))]
		set
		{
			ParamIs.NotNull(() => value);
			_realname = value;
		}
	}

	public virtual bool ShowChatbox { get; set; }

	public virtual bool Standalone { get; set; }

	/// <summary>
	/// Custom stylesheet name. If null or empty, default stylesheet is used.
	/// </summary>
	public virtual string? Stylesheet { get; set; }

	public virtual bool Supporter { get; set; }

	public virtual int TwitterId { get; set; }

	public virtual string TwitterName
	{
		get => _twitterName;
		[MemberNotNull(nameof(_twitterName))]
		set
		{
			ParamIs.NotNull(() => value);
			_twitterName = value;
		}
	}

	public virtual string TwitterOAuthToken
	{
		get => _oauthToken;
		[MemberNotNull(nameof(_oauthToken))]
		set
		{
			ParamIs.NotNull(() => value);
			_oauthToken = value;
		}
	}

	public virtual string TwitterOAuthTokenSecret
	{
		get => _oauthTokenSecret;
		[MemberNotNull(nameof(_oauthTokenSecret))]
		set
		{
			_oauthTokenSecret = value;
			ParamIs.NotNull(() => value);
		}
	}

	public virtual int UnreadNotificationsToKeep { get; set; }

	public virtual User User
	{
		get => _user;
		[MemberNotNull(nameof(_user))]
		set
		{
			ParamIs.NotNull(() => value);
			_user = value;
		}
	}
}
