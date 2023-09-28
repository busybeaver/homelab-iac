import * as pulumi from '@pulumi/pulumi';
import { NextDnsProfileProvider, type ProviderArgs } from './nextdns_profile_provider';
import type { Profile } from './types';

export class NextDnsProfile extends pulumi.dynamic.Resource {
  // Outputs from our inputs
  public readonly account!: pulumi.Output<string>;

  // Outputs from API response
  public readonly profile!: pulumi.Output<Profile>;

  constructor(name: string, args: ProviderArgs, opts?: pulumi.CustomResourceOptions) {
    super(new NextDnsProfileProvider(args), name, {
      account: args.account,
      profile: null,
    }, opts);
  }
}
