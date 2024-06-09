FROM fluent/fluentd:v1.16-1

# Use root account to use apk
USER root

# below RUN includes plugin as examples elasticsearch is not required
# you may customize including plugins as you wish
RUN apk add --no-cache --update --virtual .build-deps \
        sudo build-base ruby-dev libpq-dev \
 && sudo gem install fluent-plugin-sql \
 && sudo gem install pg \
 && sudo gem sources --clear-all 
#  && sudo ln -s /usr/lib/libpq.so.5 /usr/lib/libpq.so.5.15

#  && apk del .build-deps \
#  && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem

# COPY fluent.conf /fluentd/etc/
# COPY entrypoint.sh /bin/

USER fluent