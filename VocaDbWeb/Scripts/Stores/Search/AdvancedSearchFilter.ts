export default interface AdvancedSearchFilter {
	description?: string;

	filterType: string;

	negate?: boolean;

	param: string;
}
