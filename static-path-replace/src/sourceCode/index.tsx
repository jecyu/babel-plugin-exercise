import React, { Fragment, ReactElement, useCallback, useMemo } from 'react';
import { View, Image } from '@tarojs/components';

import { jumpTo } from '../../../utils';
import { useClassnames, useStateHook } from '../../../utils/user-hooks';
import { ProductServiceState, TAB_TYPE } from './index.d';
import './index.scss';
import FREIGHT_STANDARD_ICON from '../../../images/service/freight-standard@2x.png';
import SPECIAL_TRANSPORT_ICON from '../../../images/service/city-special-transport@2x.png';
import VEHICLE_DIRECT_ICON from '../../../images/service/vehicle-direct@2x.png';

const productTypes = [{
  id: '0',
  name: '产品服务1',
  desc: '20kg以上',
  imgUrl: FREIGHT_STANDARD_ICON,
  onClick: () => {
    jumpTo('/pages/h5-view/index', {
      url: 'https://www.jecyu.com/mobile/pack.html'
    });
  }
}, {
  id: '1',
  name: '产品服务2',
  desc: '同城搬家/拉货',
  imgUrl: SPECIAL_TRANSPORT_ICON,
  onClick: () => {
    jumpTo('/pages/h5-view/index', {
      url: 'https://www.jecyu.com/mobile/fczy.html'
    });
  }
}, {
  id: '2',
  name: '产品服务3',
  desc: '3000kg以上',
  imgUrl: VEHICLE_DIRECT_ICON,
  onClick: () => {
    jumpTo('/pages/h5-view/index', {
      url: 'https://www.jecyu.com/mobile/delivery.html'
    });
  }
}];

const additionalCharges = [{
  id: '1',
  name: '货物保管费',
  onClick: () => {
    jumpTo('/pages/h5-view/index', {
      title: '货物保管费',
      url: 'https://www.jecyu.com/mobile/cargo.html'
    });
  }
}];
export default function ProductService(): ReactElement {
  const baseClass = 'freight-product-service';
  const classnames = useClassnames(baseClass);
  const [state, setState] = useStateHook<ProductServiceState>({
    selectedTabType: TAB_TYPE.PRODUCT_TYPE
  });
  const handleTabChange = useCallback((type: TAB_TYPE) => {
    setState({
      selectedTabType: type
    });
  }, []);

  const $products = useMemo(() => <View className={classnames('tab-content-products')}>
            {productTypes && productTypes.map(item => <View key={item.id} className={classnames('tab-content-products-item')} onClick={item.onClick}>
                        <View className={classnames('tab-content-products-item-content')}>
                            <View className={classnames('tab-content-products-item-content-name')}>
                                {item.name}
                            </View>
                            <View className={classnames('tab-content-products-item-content-desc')}>
                                {item.desc}
                            </View>
                        </View>
                        <Image className={classnames('tab-content-products-item-img')} src={item.imgUrl}></Image>
                    </View>)}
        </View>, []);

  const $additionalCharge = useMemo(() => <View className={classnames('tab-content-additional-charge')}>
            <Image className={classnames('tab-content-additional-charge-img')} src={require('../../../images/service/additional-charge-3d@2x.png')}></Image>
            <View className={classnames('tab-content-additional-charge-head')}>
                <Image className={classnames('tab-content-additional-charge-head-img')} src={require('../../../images/service/additional-charge@2x.png')}></Image>
                <View className={classnames('tab-content-additional-charge-head-title')}>
                    附加费查询
                </View>
            </View>
            <View className={classnames('tab-content-additional-charge-list')}>
                {additionalCharges && additionalCharges.map(item => <View key={item.id} className={classnames('tab-content-additional-charge-list-item')} onClick={item.onClick}>
                            <View className={classnames('tab-content-additional-charge-list-item-name')}>
                                {item.name}
                            </View>
                            <View className={classnames('tab-content-additional-charge-list-item-arrow')}></View>
                        </View>)}
            </View>
        </View>, []);
  const renderTabContent = useCallback(() => {
    const {
      selectedTabType
    } = state;

    switch (selectedTabType) {
      case TAB_TYPE.PRODUCT_TYPE:
        return $products;
      case TAB_TYPE.ADDITIONAL_CHARGE:
        return $additionalCharge;

      default:
        return null;
    }
  }, []);
  return <View className={baseClass}>
            <View className={classnames('tab-content')}>
                {renderTabContent()}
            </View>
        </View>;
}