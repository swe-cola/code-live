# code-live

![codelive](https://user-images.githubusercontent.com/41565118/97793511-52514d80-1c30-11eb-86ea-4f26d87c37f7.gif)
![code_live_execution](https://user-images.githubusercontent.com/41565118/97793870-46b45580-1c35-11eb-9faa-c976c7b30f79.gif)

Code Live is a web based code editor that lets you share your ideas in an instant.

## Getting Started

You can run the code by executing `run.py`

### Prerequisites

You need to set some enviornment variables before executing. Create `.env` file in the root directory.

```
YORKIE_AGENT_URL=""
MONGO_USER_HOST=""
MONGO_USER_PORT=0000
```

### Installing

Libraries that you need before executing the code is written in `requirements.txt`.

```
flask==1.1.2
python-dotenv==0.14.0
flask-mongoengine==0.9.5
```

## Open Sources

The open sources we used for Code-Live is:

|Name|Purpose|License|URL|
|------|---|---|---|
|yorkie|to support simultaneous code editor|Apache License|[github](https://github.com/yorkie-team/yorkie-js-sdk)|
|codemirror|to support several language modes and syntax highlighting|MIT License|[github](https://github.com/codemirror/codemirror)|