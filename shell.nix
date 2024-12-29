{ pkgs ? import <nixpkgs> {} }:

let
  pythonPackages = ps: with ps; [
    pip  # Add pip explicitly
    requests
    xmltodict
    pyyaml
    aiohttp
    flask
    flask-cors
  ];

  python = pkgs.python3.withPackages pythonPackages;

in pkgs.mkShell {
  buildInputs = with pkgs; [
    # Python environment
    python
    
    # Node.js environment
    nodejs_20
    nodePackages.npm
    
    # Development tools
    watchman
  ];

  shellHook = ''
    # Create virtual environment if it doesn't exist
    if [ ! -d .venv ]; then
      python -m venv .venv
      source .venv/bin/activate
      pip install requests xmltodict pyyaml aiohttp flask flask-cors
    else
      source .venv/bin/activate
    fi

    # Set up Node.js environment variables
    export NODE_OPTIONS=--openssl-legacy-provider
    
    # Install frontend dependencies if node_modules doesn't exist
    if [ ! -d frontend/node_modules ]; then
      echo "Installing frontend dependencies..."
      cd frontend && npm install && cd ..
    fi

    # Print welcome message
    echo "Development environment ready!"
    echo "To start the server: cd server && python server.py"
    echo "To start the frontend: cd frontend && npm start"
  '';

  # Environment variables
  PYTHONPATH = "./server";
  NODE_ENV = "development";
}