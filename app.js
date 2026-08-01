(function(){
  'use strict';

  function imageValue(value){
    return String(value||'').trim();
  }

  function decodeDriveId(value){
    try{
      return decodeURIComponent(value);
    }catch(error){
      return value;
    }
  }

  function driveFileId(value){
    var url=imageValue(value);

    var match=url.match(
      /drive\.google\.com\/file\/d\/([^/?#]+)/i
    );

    if(match){
      return decodeDriveId(match[1]);
    }

    match=url.match(
      /(?:drive\.google\.com|drive\.usercontent\.google\.com)\/[^?#]*[?&]id=([^&#]+)/i
    );

    if(match){
      return decodeDriveId(match[1]);
    }

    match=url.match(
      /lh3\.googleusercontent\.com\/d\/([^=/?#]+)/i
    );

    if(match){
      return decodeDriveId(match[1]);
    }

    return '';
  }

  function normalizeImageUrl(value){
    var url=imageValue(value);

    if(!url){
      return '';
    }

    var driveId=driveFileId(url);

    if(driveId){
      return 'https://drive.google.com/thumbnail?id='+
        encodeURIComponent(driveId)+
        '&sz=w1600';
    }

    if(/^data:image\//i.test(url)){
      return url;
    }

    if(/^https?:\/\//i.test(url)){
      return url;
    }

    if(/^(?:\.{0,2}\/|\/)[^\s]+/.test(url)){
      return url;
    }

    return '';
  }

  function prepareImage(image){
    if(!image||image.dataset.appReady==='1'){
      return;
    }

    image.dataset.appReady='1';

    var source=image.getAttribute('src')||'';
    var normalized=normalizeImageUrl(source);

    if(!normalized){
      image.style.display='none';
      return;
    }

    if(normalized!==source){
      image.setAttribute('src',normalized);
    }

    image.addEventListener('error',function(){
      image.style.display='none';
    });
  }

  function prepareImages(root){
    var images=root.querySelectorAll('img');

    images.forEach(function(image){
      prepareImage(image);
    });
  }

  function formatJapaneseDate(value){
    var text=String(value||'').trim();

    if(!text){
      return '';
    }

    var japanese=text.match(
      /^(\d{4})年(\d{1,2})月(\d{1,2})日/
    );

    if(japanese){
      return japanese[1]+'年'+
        Number(japanese[2])+'月'+
        Number(japanese[3])+'日';
    }

    var direct=text.match(
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/
    );

    if(direct){
      return direct[1]+'年'+
        Number(direct[2])+'月'+
        Number(direct[3])+'日';
    }

    var date=new Date(text);

    if(isNaN(date.getTime())){
      return text;
    }

    try{
      var parts=new Intl.DateTimeFormat(
        'ja-JP',
        {
          timeZone:'Asia/Tokyo',
          year:'numeric',
          month:'numeric',
          day:'numeric'
        }
      ).formatToParts(date);

      var result={};

      parts.forEach(function(part){
        if(
          part.type==='year'||
          part.type==='month'||
          part.type==='day'
        ){
          result[part.type]=part.value;
        }
      });

      if(result.year&&result.month&&result.day){
        return result.year+'年'+
          Number(result.month)+'月'+
          Number(result.day)+'日';
      }
    }catch(error){
      return date.getFullYear()+'年'+
        (date.getMonth()+1)+'月'+
        date.getDate()+'日';
    }

    return date.getFullYear()+'年'+
      (date.getMonth()+1)+'月'+
      date.getDate()+'日';
  }

  function formatDateElements(root){
    var elements=root.querySelectorAll('[data-date]');

    elements.forEach(function(element){
      var source=element.getAttribute('data-date')||
        element.textContent||
        '';

      element.textContent=formatJapaneseDate(source);
    });
  }

  function enableSmoothAnchors(){
    var links=document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link){
      link.addEventListener('click',function(event){
        var selector=link.getAttribute('href');

        if(!selector||selector==='#'){
          return;
        }

        var target=document.querySelector(selector);

        if(target){
          event.preventDefault();

          target.scrollIntoView({
            behavior:'smooth',
            block:'start'
          });
        }
      });
    });
  }

  function observePage(){
    if(!window.MutationObserver){
      return;
    }

    var observer=new MutationObserver(function(records){
      records.forEach(function(record){
        record.addedNodes.forEach(function(node){
          if(node.nodeType!==1){
            return;
          }

          if(node.matches&&node.matches('img')){
            prepareImage(node);
          }

          if(node.querySelectorAll){
            prepareImages(node);
            formatDateElements(node);
          }
        });
      });
    });

    observer.observe(document.body,{
      childList:true,
      subtree:true
    });
  }

  function start(){
    enableSmoothAnchors();
    prepareImages(document);
    formatDateElements(document);
    observePage();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start);
  }else{
    start();
  }
})();
