{
  description = "Sidedoor development and API/DB test environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_22
              postgresql_16
              openssh
              gnutar
              curl
              jq
              ripgrep
              git
            ];

            shellHook = ''
              echo "Sidedoor test environment"
              echo "Tools: node, npm, psql, ssh, tar, curl, jq, rg"
              echo "Set DATABASE_URL before comparing Postgres query output with API output."
            '';
          };
        });
    };
}
