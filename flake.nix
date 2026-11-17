{
  inputs = {
    # keep-sorted start block=yes
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs = {
        nixpkgs-lib = {
          follows = "nixpkgs";
        };
      };
    };
    nixpkgs = {
      url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    };
    systems = {
      url = "github:nix-systems/default";
    };
    # keep-sorted end
  };

  outputs =
    {
      flake-parts,
      systems,
      ...
    }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } (
      {
        inputs,
        ...
      }:
      {
        systems = import systems;

        perSystem =
          {
            pkgs,
            ...
          }:
          {
            # pi package の開発に必要な最小ツールセット。
            # スモークテストは型除去済みの node 24 で直接実行できる。
            # typebox は pi 実行時にホストが供給するため devShell には入れない
            # (ローカルで node scripts/smoke.mjs を回す場合は README 手順の
            # npm install --no-save typebox が必要)。
            devShells = {
              default = pkgs.mkShell {
                packages = with pkgs; [
                  # keep-sorted start
                  nodejs_24
                  pi-coding-agent
                  typescript
                  # keep-sorted end
                ];
              };
            };
          };
      }
    );
}
