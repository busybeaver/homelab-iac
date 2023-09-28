import * as pulumi from '@pulumi/pulumi';
import { diff } from 'deep-object-diff';
import { request } from 'undici';
import type { Profile } from './types';

export interface ProviderArgs {
  account: string;
  endpoint?: string;
  apiKey?: string;
}

interface SuccessResponse<Data> {
  data: Data;
  meta?: {
    paginatio: {
      cursor: string;
    };
  };
}

interface ErrorResponse {
  errors: {
    code: string;
    detail: string;
    source: {
      parameter: string;
    };
  }[];
}

export interface ProfileWrapper {
  profile: Profile;
}
interface CreateData {
  id: string;
}
interface CreateResult extends pulumi.dynamic.CreateResult {
  outs: ProfileWrapper;
}

interface ReadResult extends pulumi.dynamic.ReadResult {
  props: ProfileWrapper;
}
interface UpdateResult extends pulumi.dynamic.UpdateResult {
  props: ProfileWrapper;
}

const getArgs = ({ account, endpoint, apiKey }: ProviderArgs): Required<ProviderArgs> => {
  const config = new pulumi.Config(`nextdns-${account}`);

  return {
    account,
    endpoint: endpoint ?? config.get('endpoint') ?? 'https://api.nextdns.io',
    apiKey: apiKey ?? config.require('apiKey'),
  };
};

const isSuccessResponse = <Data>(
  body: SuccessResponse<Data> | ErrorResponse,
  statusCode: number,
): body is SuccessResponse<Data> => {
  // status code 200 is sometimes used for errors (in this case we need to check for an 'errors' property):
  // https://nextdns.github.io/api/#handling-errors
  return statusCode >= 200 && statusCode < 300 && (body as ErrorResponse).errors === undefined;
};

export class NextDnsProfileProvider implements pulumi.dynamic.ResourceProvider {
  _args: ProviderArgs;
  _provider: pulumi.Resource;

  constructor(args: ProviderArgs) {
    this._args = getArgs(args);
    class NextDnsProfileProviderResource extends pulumi.CustomResource {
      constructor() {
        super('custom:nextdns:profileProvider', args.account);
      }
    }
    this._provider = new NextDnsProfileProviderResource();
  }

  async check(oldProfile: ProfileWrapper, newProfile: ProfileWrapper): Promise<pulumi.dynamic.CheckResult> {
    // TODO: if needed in the future, implement this method
    return {};
  }

  async diff(id: string, oldProfile: ProfileWrapper, newProfile: ProfileWrapper): Promise<pulumi.dynamic.DiffResult> {
    const profileDiff = diff(oldProfile.profile, newProfile.profile);
    return {
      changes: Object.keys(profileDiff).length > 0,
    };
  }

  async create({ profile }: ProfileWrapper): Promise<CreateResult> {
    const {
      statusCode,
      body,
    } = await request(`${this._args.endpoint}/profiles`, {
      method: 'POST',
      headers: { 'X-Api-Key': this._args.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    const jsonBody: SuccessResponse<CreateData> | ErrorResponse = await body.json();

    if (!isSuccessResponse(jsonBody, statusCode)) {
      throw new pulumi.ResourceError(`Failed to create profile: ${JSON.stringify(jsonBody.errors)}`, this._provider);
    }

    return {
      id: jsonBody.data.id,
      outs: { profile },
    };
  }

  async read(id: string): Promise<ReadResult> {
    const {
      statusCode,
      body,
    } = await request(`${this._args.endpoint}/profiles/${id}`, {
      method: 'GET',
      headers: { 'X-Api-Key': this._args.apiKey },
    });

    const jsonBody: SuccessResponse<Profile> | ErrorResponse = await body.json();

    if (!isSuccessResponse(jsonBody, statusCode)) {
      throw new pulumi.ResourceError(`Failed to read profile: ${JSON.stringify(jsonBody.errors)}`, this._provider);
    }

    return {
      id: id,
      props: { profile: jsonBody.data },
    };
  }

  async update(id: string, oldProfile: ProfileWrapper, newProfile: ProfileWrapper): Promise<UpdateResult> {
    const {
      statusCode,
      body,
    } = await request(`${this._args.endpoint}/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'X-Api-Key': this._args.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile.profile),
    });

    const jsonBody: SuccessResponse<CreateData> | ErrorResponse = await body.json();

    if (!isSuccessResponse(jsonBody, statusCode)) {
      throw new pulumi.ResourceError(`Failed to update profile: ${JSON.stringify(jsonBody.errors)}`, this._provider);
    }

    return {
      props: newProfile,
    };
  }

  async delete(id: string): Promise<void> {
    const {
      statusCode,
      body,
    } = await request(`${this._args.endpoint}/profiles/${id}`, {
      method: 'DELETE',
      headers: { 'X-Api-Key': this._args.apiKey },
    });

    const jsonBody: SuccessResponse<Profile> | ErrorResponse = await body.json();

    if (!isSuccessResponse(jsonBody, statusCode)) {
      throw new pulumi.ResourceError(`Failed to delete profile: ${JSON.stringify(jsonBody.errors)}`, this._provider);
    }
  }
}
