{ pkgs }: {
  deps = [
    pkgs.nano
    pkgs.tm
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server
  ];
}