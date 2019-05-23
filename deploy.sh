#!/usr/bin/env bash

gcloud functions deploy xsu-gql-server --runtime nodejs8 --trigger-http --entry-point handler --timeout 120s --memory 512MB
