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
    pre-commit-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs = {
        nixpkgs = {
          follows = "nixpkgs";
        };
      };
    };
    systems = {
      url = "github:nix-systems/default";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs = {
        nixpkgs = {
          follows = "nixpkgs";
        };
      };
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

        imports = [
          inputs.pre-commit-hooks.flakeModule
          inputs.treefmt-nix.flakeModule
        ];

        perSystem =
          {
            pkgs,
            config,
            ...
          }:
          let
            treefmtBuild = config.treefmt.build;
          in
          {
            # pi package の開発に必要な最小ツールセット。
            # スモークテストは型除去済みの node 24 で直接実行できる。
            # typebox は pi 実行時にホストが供給するため devShell には入れない
            # (ローカルで node scripts/smoke.mjs を回す場合は README 手順の
            # npm install --no-save typebox が必要)。
            devShells = {
              default = pkgs.mkShell {
                inputsFrom = [
                  treefmtBuild.devShell
                ];
                packages = with pkgs; [
                  # keep-sorted start
                  nodejs_24
                  pi-coding-agent
                  # keep-sorted end
                ];
                shellHook = ''
                  ${config.pre-commit.installationScript}
                '';
              };
            };
            pre-commit = {
              check = {
                enable = false;
              };
              settings = {
                package = pkgs.prek;
                src = ./.;
                hooks = {
                  # keep-sorted start block=yes
                  ripsecrets = {
                    enable = true;
                  };
                  treefmt = {
                    enable = true;
                    packageOverrides = {
                      treefmt = treefmtBuild.wrapper;
                    };
                  };
                  trufflehog = {
                    enable = true;
                  };
                  # keep-sorted end
                };
              };
            };

            formatter = treefmtBuild.wrapper;

            treefmt = {
              projectRootFile = "flake.nix";
              flakeCheck = false;
              programs = {
                # keep-sorted start block=yes
                keep-sorted = {
                  enable = true;
                };
                nixfmt = {
                  enable = true;
                };
                # keep-sorted end
              };
            };
          };
      }
    );
}
