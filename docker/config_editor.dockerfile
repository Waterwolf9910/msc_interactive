FROM node:20

EXPOSE 3000

COPY ./config_editor.js /config_editor.js

CMD [ "/config_editor.js" ]
