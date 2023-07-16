import * as cloudinit from '@pulumi/cloudinit';
import * as pulumi from '@pulumi/pulumi';

export const ubuntuConfig = pulumi.output(
  cloudinit.getConfig({
    gzip: false,
    base64Encode: false,
    parts: [{
      contentType: 'text/plain',
      filename: 'ubuntu.cfg',
      content: `
package_update: true
package_upgrade: true

# ssh configuration
ssh_pwauth: false
disable_root: true
disable_root_opts: no-port-forwarding,no-agent-forwarding,no-X11-forwarding
ssh:
  emit_keys_to_console: false

timezone: Europe/Berlin

keyboard:
  layout: de

ntp:
  enabled: true
  ntp_client: chrony

groups:
  - docker

system_info:
  default_user:
    groups: [ docker ]

packages:
  - apt-transport-https
  - ca-certificates
  - curl
  - gnupg
  - lsb-release
  - unattended-upgrades

runcmd:
  # ssh configuration
  - sed -i -e '/^Port/s/^.*$/Port 4444/' etc/ssh/sshd_config
  - sed -i -e '/^PermitRootLogin/s/^.*$/PermitRootLogin no/' /etc/ssh/sshd_config
  # install docker and tailscale
  - mkdir -p /etc/apt/keyrings
  - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  - echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  - curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.noarmor.gpg | tee /usr/share/keyrings/tailscale-archive-keyring.gpg > /dev/null
  - curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.tailscale-keyring.list | tee /etc/apt/sources.list.d/tailscale.list
  - apt-get update
  - apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin tailscale
  - systemctl enable docker
  - systemctl start docker
  - systemctl enable tailscaled
  - systemctl start tailscaled

final_message: "The system is finally up, after $UPTIME seconds"
        `,
    }],
  }),
);
