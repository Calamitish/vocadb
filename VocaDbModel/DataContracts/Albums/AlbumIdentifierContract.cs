using System.Runtime.Serialization;
using VocaDb.Model.Domain.Albums;

namespace VocaDb.Model.DataContracts.Albums;

[DataContract(Namespace = Schemas.VocaDb)]
public class AlbumIdentifierContract
{
#nullable disable
	public AlbumIdentifierContract() { }
#nullable enable

	public AlbumIdentifierContract(AlbumIdentifier identifier)
	{
		Value = identifier.Value;
	}

	[DataMember]
	public string Value { get; init; }
}
