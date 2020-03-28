with import <nixpkgs> {};
mkShell{
    buildInputs = [
        nodejs-12_x
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}