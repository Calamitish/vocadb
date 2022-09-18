import { UserApiContract } from '@/DataContracts/User/UserApiContract';
import { UserGroup } from '@/Models/Users/UserGroup';
import {
	UserOptionalField,
	UserRepository,
} from '@/Repositories/UserRepository';
import { ServerSidePagingStore } from '@/Stores/ServerSidePagingStore';
import { StoreWithPagination } from '@vocadb/route-sphere';
import Ajv, { JSONSchemaType } from 'ajv';
import { computed, makeObservable, observable, runInAction } from 'mobx';

// Corresponds to the UserSortRule enum in C#.
export enum UserSortRule {
	RegisterDate = 'RegisterDate',
	Name = 'Name',
	Group = 'Group',
}

export interface ListUsersRouteParams {
	disabledUsers?: boolean;
	filter?: string;
	groupId?: UserGroup;
	knowsLanguage?: string;
	onlyVerifiedArtists?: boolean;
	page?: number;
	pageSize?: number;
	sort?: UserSortRule;
}

// TODO: Use single Ajv instance. See https://ajv.js.org/guide/managing-schemas.html.
const ajv = new Ajv({ coerceTypes: true });

// TODO: Make sure that we compile schemas only once and re-use compiled validation functions. See https://ajv.js.org/guide/getting-started.html.
const schema: JSONSchemaType<ListUsersRouteParams> = require('./ListUsersRouteParams.schema');
const validate = ajv.compile(schema);

export class ListUsersStore
	implements StoreWithPagination<ListUsersRouteParams> {
	@observable public disabledUsers = false;
	@observable public group = UserGroup.Nothing;
	@observable public loading = false;
	@observable public knowsLanguage = '';
	@observable public onlyVerifiedArtists = false;
	@observable public page: UserApiContract[] = []; // Current page of items
	public readonly paging = new ServerSidePagingStore(20); // Paging view model
	@observable public searchTerm = '';
	@observable public sort = UserSortRule.RegisterDate;

	public constructor(private readonly userRepo: UserRepository) {
		makeObservable(this);
	}

	public readonly clearResultsByQueryKeys: (keyof ListUsersRouteParams)[] = [
		'disabledUsers',
		'groupId',
		'knowsLanguage',
		'onlyVerifiedArtists',
		'pageSize',
		'filter',
	];

	@computed.struct public get routeParams(): ListUsersRouteParams {
		return {
			disabledUsers: this.disabledUsers,
			filter: this.searchTerm,
			groupId: this.group,
			knowsLanguage: this.knowsLanguage,
			onlyVerifiedArtists: this.onlyVerifiedArtists,
			page: this.paging.page,
			pageSize: this.paging.pageSize,
			sort: this.sort,
		};
	}
	public set routeParams(value: ListUsersRouteParams) {
		this.disabledUsers = value.disabledUsers ?? false;
		this.searchTerm = value.filter ?? '';
		this.group = value.groupId ?? UserGroup.Nothing;
		this.knowsLanguage = value.knowsLanguage ?? '';
		this.onlyVerifiedArtists = value.onlyVerifiedArtists ?? false;
		this.paging.page = value.page ?? 1;
		this.paging.pageSize = value.pageSize ?? 20;
		this.sort = value.sort ?? UserSortRule.RegisterDate;
	}

	public validateRouteParams = (data: any): data is ListUsersRouteParams => {
		return validate(data);
	};

	private pauseNotifications = false;

	public updateResults = async (clearResults: boolean): Promise<void> => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;

		const pagingProperties = this.paging.getPagingProperties(clearResults);
		const result = await this.userRepo.getList({
			paging: pagingProperties,
			query: this.searchTerm,
			sort: this.sort,
			groups: this.group,
			includeDisabled: this.disabledUsers,
			onlyVerified: this.onlyVerifiedArtists,
			knowsLanguage: this.knowsLanguage,
			nameMatchMode: 'Auto' /* TODO: enum */,
			fields: [UserOptionalField.MainPicture],
		});

		this.pauseNotifications = false;

		runInAction(() => {
			this.page = result.items;

			if (pagingProperties.getTotalCount)
				this.paging.totalItems = result.totalCount;
		});
	};

	public updateResultsWithTotalCount = (): Promise<void> => {
		return this.updateResults(true);
	};

	public updateResultsWithoutTotalCount = (): Promise<void> => {
		return this.updateResults(false);
	};

	public onClearResults = (): void => {
		this.paging.goToFirstPage();
	};
}
