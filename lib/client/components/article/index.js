import React from 'react'
import Section from '../section'
import ReadMore from '../read-more-link'
import LazyImages from '../lazy-images'

import './article.less'

export default function Article ({ title, expanded, full, doc, onExpand }) {
  let loadingExpandedDoc = (expanded && !full)
  return (
    <article className='Article'>
      <h1 className='Article-title'>{title.replace(/_/g, ' ')}</h1>
      <div className='Article-content'>
        {!doc ? 'Loading...'
          : <LazyImages>
              {doc.sections.map(Section)}
            </LazyImages>}
      </div>
      <ReadMore title={title} loading={loadingExpandedDoc}
        onExpand={onExpand}/>
    </article>
  )
}
